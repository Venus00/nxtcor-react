import { useEffect, useState } from "react";
import SaveButton from "../../common/SaveButton";
import Toast from "../../common/Toast";
import axios from "axios";


const ArmingTable = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['00-02', '02-04', '04-06', '06-08', '08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-00'];
    // State to keep track of checkbox status
    const [checkedState, setCheckedState] = useState(
        Array(daysOfWeek.length).fill(Array(timeSlots.length).fill(false))
    );

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' // Default type, can be 'success', 'error', or 'info'
    });


    const submitMotionConfig = async () => {
        const actionUrl = "/cgi-bin/cron_post_motion.cgi"

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

                setToast({ message: 'Arming Times Saved', type: 'success' });
            } else {

                setToast({ message: response.data, type: 'error' });
            }
        } catch (error) {
            console.log(error)
            setToast({ message: 'Error ', type: 'error' });
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
            " /cgi-bin/cron_times_get_motion.cgi"
        );

        convertCronExpressionsToCheckedState(response.data)

    }


    useEffect(() => {
        getData()

    }, [])
    return (
        <div className='overflow-x-auto w-3/4 p-6'>
            <div className="flex justify-end">
                <button
                    className="mb-2 px-4 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                    onClick={clearAllCheckboxes}
                >
                    Clear All
                </button>
            </div>
            <table className="min-w-full border">
                <thead>
                    <tr>
                        <th className="border px-4 py-2"></th>
                        {timeSlots.map((slot) => (
                            <th key={slot} className="border text-black font-medium text-sm px-4 py-2">{slot}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {daysOfWeek.map((day, dayIndex) => (
                        <tr key={day}>
                            <td className="border text-sm font-medium text-black border-gray-300 px-4 py-2">{day}</td>
                            {timeSlots.map((slot, timeIndex) => (
                                <td key={slot} className="border border-gray-300 px-4 py-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={checkedState[dayIndex][timeIndex]}
                                        onChange={() => handleCheckboxChange(dayIndex, timeIndex)}
                                        className={`h-4 w-4 rounded cursor-pointer appearance-none ${checkedState[dayIndex][timeIndex] ? 'bg-green-500 border-green-500' : 'bg-gray-300 border-gray-300'}`}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex flex-col items-center justify-center gap-4  mt-4">

                <div>
                    <SaveButton onClick={submitMotionConfig} label="SAVE CHANGES" loading={false} />
                </div>
            </div>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
        </div>
    );
};

export default ArmingTable;
