
import { useEffect, useState } from "react";
import SaveButton from "../../common/SaveButton";
import Toggle from "../../common/Toggle";
import axios from "axios";
import Toast from "../../common/Toast";




const Display = () => {

    const [isCheckedDisplayTime, setIsCheckedDisplayTime] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' // Default type, can be 'success', 'error', or 'info'
    });


    const submitDisplayConfig = async () => {
        try {
            const actionUrl = 'cgi-bin/mj-settings_new.cgi';

            setIsSaving(true)
            const payload = {
                _osd_enabled: isCheckedDisplayTime,
                _osd_font: '/usr/share/fonts/truetype/UbuntuMono-Regular.ttf',
                _osd_template: '%d.%m.%Y  %H:%M:%S ',
                _osd_posX: 30,
                _osd_posY: 30,
                _osd_privacyMasks: '',
                action: 'update_restart'

            }

            const response = await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });


            if (response.data.includes('success')){
                setToast({ message:  'Configuration Updated', type: 'success' });
                setIsSaving(false)
            } else {
                setToast({ message:  'Error updating Configuration', type: 'error' });
                setIsSaving(false)
            }
        } catch (error) {
            setIsSaving(false)
            setToast({ message: 'Error', type: 'error' });
        }
    };

    const getData = async () => {
        const response = await axios.get(
            "/api/v1/config.json"
        );

        setIsCheckedDisplayTime(response.data.osd.enabled);
    }


    useEffect(() => {
        getData()

    }, [])


    return (
        <div className="space-y-4">
            <div className={`  grid grid-cols-2    gap-4
          w-full   /* Default for mobile */
          sm:w-1/2 /* Tablet size (640px and up) */
          md:w-1/3 /* Desktop size (768px and up) */
          lg:w-2/4 /* Larger screens (1024px and up) */
         `}
            >
            <Toggle label="Display Time" value={isCheckedDisplayTime} setValue={setIsCheckedDisplayTime} />
            </div>
            <SaveButton onClick={submitDisplayConfig}  loading={isSaving} label='SAVE CHANGES' />
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

        </div>
    );
};

export default Display;