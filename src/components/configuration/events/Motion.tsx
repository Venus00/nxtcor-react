import { useEffect, useState } from "react";
import SaveButton from "../../common/SaveButton";


import axios from "axios";
import Toggle from "../../common/Toggle";
import Stepper from "./Stepper";
import Toast from "../../common/Toast";


const Motion = () => {

    const [isCheckedMotion, setIsCheckedMotion] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' // Default type, can be 'success', 'error', or 'info'
    });
    const [isSaving, setIsSaving] = useState(false);
    const submitMotionConfig = async () => {
        const actionUrl = "/cgi-bin/mj-settings_new.cgi"; // Replace with your actual URL
        setIsSaving(true)
        const payload = {
            _motionDetect_enabled: false,
            action: 'update_restart'
        };

        try {

            const response = await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.data.includes('success')) {
                setIsSaving(false)
                setToast({ message: 'Détection de mouvement désactivée avec succès', type: 'success' });
            } else {
                setIsSaving(false)
                setToast({ message: 'Erreur', type: 'error' });
            }
        } catch (error) {
            console.log(error)
            setIsSaving(false)
            setToast({ message: 'Erreur', type: 'error' });

        }
    }

    const getData = async () => {
        const response = await axios.get(
            "/api/v1/config.json"
        );
        const data = response.data.motionDetect
        // Log the response from the API to the console
        console.log("response", response);
        setIsCheckedMotion(data.enabled);

    }


    useEffect(() => {
        getData()

    }, [])





    return (
        <div className={`  space-y-8
          lg:w-full
         `}
        >
            <div className="w-1/4">
                <Toggle label="Activer la Détection de Mouvement" value={isCheckedMotion} setValue={setIsCheckedMotion} />
            </div>
            {isCheckedMotion && <Stepper />}

            {!isCheckedMotion && <div className="flex flex-col items-center  w-3/4 justify-center gap-4  mt-4">

                <div>
                    <SaveButton onClick={submitMotionConfig} label="ENREGISTRER LES MODIFICATIONS" loading={isSaving} />
                </div>
            </div>}

            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

        </div >
    );
};

export default Motion;