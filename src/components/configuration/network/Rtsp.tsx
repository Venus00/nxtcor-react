import { useEffect, useState } from "react";

import SaveButton from "../../common/SaveButton";


import Toggle from "../../common/Toggle";

import TextField from "../../common/TextField";
import axios from "axios";
import Toast from "../../common/Toast";


const Rtsp = () => {

    const [isCheckedRtsp, setIsCheckedRtsp] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [Rtsp,] = useState(`rtsp://root:<your-password>@${window.location.host}/stream=0`);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' // Default type, can be 'success', 'error', or 'info'
    });

    const getData = async () => {
        const response = await axios.get(
            "/api/v1/config.json"
        );
        const rtsp_data = response.data.rtsp
        // Log the response from the API to the console
        console.log("response", rtsp_data);

    }

    useEffect(() => {
        getData()

    }, [])
    const handleSave = async () => {
        try {
            setIsSaving(true)
            const actionUrl = '/cgi-bin/mj-settings_new.cgi'; // Replace with your actual URL


            const payload = {
                action: 'update_restart',
                _rtsp_enabled: isCheckedRtsp,
                _rtsp_port: 554
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
            console.error(error);
            setToast({ message: 'Error .', type: 'error' });
            setIsSaving(false)
        }
    };

    return (
        <div className={`   space-y-6    w-2/6`}
        >
            <div className="">
                <Toggle label="Enable" value={isCheckedRtsp} setValue={setIsCheckedRtsp} />

            </div>

            <div className={`${isCheckedRtsp ? 'block' : 'hidden'} `}>
                <TextField label="URL" value={Rtsp} placeholder="" isEditable={true} />
            </div>





            <SaveButton onClick={handleSave} loading={isSaving} label='SAVE CHANGES' />
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

        </div>
    );
};

export default Rtsp;