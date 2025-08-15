import { useEffect, useState } from "react";
import SaveButton from "../../common/SaveButton";
import Toast from "../../common/Toast";
import axios from "axios";
import Toggle from "../../common/Toggle";


const Recording = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['00-02', '02-04', '04-06', '06-08', '08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-00'];
    const [enable, setEnable] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    // State to keep track of checkbox status
    const [checkedState, setCheckedState] = useState(
        Array(daysOfWeek.length).fill(Array(timeSlots.length).fill(false))
    );

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' // Default type, can be 'success', 'error', or 'info'
    });


    const submitMotionConfig = async () => {
        const actionUrl = "/cgi-bin/cron_post_recording.cgi"

        const payload = {
            cron: JSON.stringify(convertCheckedStateToCronExpressions())
        };
        try {
            const response = await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.data.includes('success')) {
                const actionUrl = 'cgi-bin/mj-settings_new.cgi';

          
            const payload = {
                action: 'update_restart',
                _records_enabled: enable,
            }

            await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
                setToast({ message: 'Schedule recording Times Saved', type: 'success' });

            } else {

                setToast({ message: response.data, type: 'error' });
            }
        } catch (error) {
            console.log(error)
            setToast({ message: 'Error ', type: 'error' });
        }
    };

    const submitMotionDisable = async () => {
        try {
            const actionUrl = 'cgi-bin/mj-settings_new.cgi';

            setIsSaving(true)
            const payload = {
                action: 'update_restart',
                _records_enabled: enable,
            }

            const response = await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });


            if (response.data.includes('success')) {
                setToast({ message: 'Configuration Updated', type: 'success' });
                setIsSaving(false)
            } else {
                setToast({ message: 'Error Updating Configuration ', type: 'error' });
                setIsSaving(false)
            }
        } catch (error) {
            console.log(error)
            setIsSaving(false)
            setToast({ message: 'Error .', type: 'error' });
        }
    };

    // Handle checkbox change
    const handleCheckboxChange = (dayIndex: number, timeIndex: number) => {
        const updatedCheckedState = checkedState.map((day, dIndex) =>
            day.map((checked: boolean, tIndex: number) => {
                if (dayIndex === dIndex && timeIndex === tIndex) {
                    return !checked;
                }
                return checked;
            })
        );
        setCheckedState(updatedCheckedState);
        console.log(JSON.stringify(convertCheckedStateToCronExpressions()))
    };

    // Clear all checkboxes
    const clearAllCheckboxes = () => {
        setCheckedState(Array(daysOfWeek.length).fill(Array(timeSlots.length).fill(false)));

    };

    const convertCheckedStateToCronExpressions = () => {
        const cronExpressions: string[] = [];

        checkedState.forEach((dayState, dayIndex) => {
            dayState.forEach((isChecked: boolean, timeIndex: number) => {
                if (isChecked) {
                    const timeSlot = timeSlots[timeIndex];
                    const [startHour] = timeSlot.split('-');
                    cronExpressions.push(`0 ${startHour} * * ${dayIndex + 1}`);
                }
            });
        });

        return cronExpressions;
    };

    const convertCronExpressionsToCheckedState = (cronExpressions: string[]) => {
        // Initialize the state with false values
        const initialState = Array(daysOfWeek.length).fill(Array(timeSlots.length).fill(false));

        // Create a new state array based on the initial state
        const updatedState = initialState.map(row => [...row]);

        // Iterate over cron expressions and update the state accordingly
        cronExpressions.forEach(expression => {
            // Extract components from the cron expression
            const [minute, hour, , , dayOfWeek] = expression.split(' ');

            if (minute !== '0' || dayOfWeek === '*') {
                // Skip invalid or non-relevant cron expressions
                return;
            }

            // Convert cron dayOfWeek (1-7) to array index (0-6)
            const dayIndex = parseInt(dayOfWeek, 10) - 1;

            // Find the time slot index based on the hour
            const timeIndex = timeSlots.findIndex(slot => slot.startsWith(hour));

            if (timeIndex !== -1) {
                updatedState[dayIndex][timeIndex] = true;
            }
        });

        setCheckedState(updatedState);
    };


    const getData = async () => {
        const response = await axios.get(
            " /cgi-bin/cron_times_get_recording.cgi"
        );
        convertCronExpressionsToCheckedState(response.data)
        const response_ = await axios.get(
            "/api/v1/config.json"
        );
        const data = response_.data.records
        console.log("response", response);
        setEnable(data.enabled);

    }


    useEffect(() => {
        getData()

    }, [])


    return (
        <div className='overflow-x-auto w-full p-6 bg-gray-700 rounded-lg'>
            <div className="grid grid-cols-3 mb-6">
                <Toggle label="Enable Recording" value={enable} setValue={setEnable} />
            </div>
            
            {enable && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                            onClick={clearAllCheckboxes}
                        >
                            Clear All
                        </button>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                        <table className="min-w-full">
                            <thead className="bg-gray-600">
                                <tr>
                                    <th className="px-4 py-3 text-left text-white font-semibold"></th>
                                    {timeSlots.map((slot) => (
                                        <th key={slot} className="px-4 py-3 text-center text-white font-semibold text-sm">
                                            {slot}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {daysOfWeek.map((day, dayIndex) => (
                                    <tr key={day} className="border-b border-gray-600 hover:bg-gray-750">
                                        <td className="px-4 py-3 text-sm font-medium text-white bg-gray-650">
                                            {day}
                                        </td>
                                        {timeSlots.map((slot, timeIndex) => (
                                            <td key={slot} className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={checkedState[dayIndex][timeIndex]}
                                                    onChange={() => handleCheckboxChange(dayIndex, timeIndex)}
                                                    className={`h-5 w-5 rounded cursor-pointer transition-all duration-200 ${
                                                        checkedState[dayIndex][timeIndex] 
                                                            ? 'bg-green-500 border-green-500' 
                                                            : 'bg-gray-400 border-gray-400 hover:bg-gray-300'
                                                    }`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            
            <div className="flex justify-center mt-6">
                {enable ? (
                    <SaveButton onClick={submitMotionConfig} label="SAVE CHANGES" loading={isSaving} />
                ) : (
                    <SaveButton onClick={submitMotionDisable} label="SAVE CHANGES" loading={isSaving} />
                )}
            </div>
            
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ message: '', type: 'info' })} 
            />
        </div>
    );


};

export default Recording;
