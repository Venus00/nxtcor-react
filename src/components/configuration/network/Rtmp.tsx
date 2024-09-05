import { useEffect, useState } from "react";

import SaveButton from "../../common/SaveButton";


import Toggle from "../../common/Toggle";

import TextField from "../../common/TextField";
import axios from "axios";
import Toast from "../../common/Toast";


const Rtmp = () => {

    const [isCheckedRtmp, setIsCheckedRtmp] = useState(true);
    const [Rtmp, setRtmp] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' // Default type, can be 'success', 'error', or 'info'
    });


    const handleSave = async () => {
        try {
            const actionUrl = '/cgi-bin/mj-settings_new.cgi'; // Replace with your actual URL
            setIsSaving(true)

            const payload = {
                action: 'update_restart',
                _outgoing_enabled: isCheckedRtmp,
                _outgoing_server: Rtmp,
                _outgoing_naluSize: 1200
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

    const getData = async () => {
        const response = await axios.get(
            "/api/v1/config.json"
        );
        const rtmp_data = response.data.outgoing
        // Log the response from the API to the console
        console.log("response", rtmp_data);
        setIsCheckedRtmp(rtmp_data.enabled);
        setRtmp(rtmp_data.server)
    }

    useEffect(() => {
        getData()

    }, [])




    return (
        <div className={`  space-y-4   w-2/6 `}
        >


            <div className="">
                <Toggle label="Enable" value={isCheckedRtmp} setValue={setIsCheckedRtmp} />
            </div>
            <div className={`${isCheckedRtmp ? 'block' : 'hidden'}  `}>
                <TextField label="URL" value={Rtmp} setValue={setRtmp} placeholder=""      isEditable={true} />
            </div>





            <SaveButton onClick={handleSave} loading={isSaving} label='SAVE CHANGES' />
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

        </div>
    );
};

export default Rtmp;