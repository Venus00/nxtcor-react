import { useState } from "react";
import TextField from "../../common/TextField";
import SaveButton from "../../common/SaveButton";
import axios from "axios";
import Toast from "../../common/Toast";
import { useNavigate } from "react-router-dom";
import Password from "../../common/Password";






const Authentification = () => {


    const [password, setpassword] = useState('');
    const [confirmpassword, setconfirmpassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' // Default type, can be 'success', 'error', or 'info'
    });

    const submitPassworfConfig = async () => {
        try {
            const actionUrl = '/cgi-bin/fw-interface_new.cgi'; // Replace with your actual URL
            setIsSaving(true)

            const payload = {
                action: 'access',
                password_default: password,
                password_confirm: confirmpassword

            }

            const response = await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });


            if (response.data.includes('success')) {
                setIsSaving(false)
                navigate('/', { replace: true }); // Navigate to the root page
                window.location.reload(); // Reload the page after navigation
            } else {
                setToast({ message: response.data, type: 'error' });
                setIsSaving(false)
            }
        } catch (error) {
            console.error(error);
            setIsSaving(false)
            setToast({ message: 'Error .', type: 'error' });
        }
    };



    return (
        <div className={`space-y-4
            w-full   /* Default for mobile */
            sm:w-1/2 /* Tablet size (640px and up) */
            md:w-1/3 /* Desktop size (768px and up) */
            lg:w-1/4 /* Larger screens (1024px and up) */
           `}
        >
            <TextField label="Username" value={'root'} placeholder="root"      isEditable={false} labelClassName="text-white" />
            <Password password={password} setPassword={setpassword}  label="New password"  labelClassName="text-white"/>
            <Password password={confirmpassword} setPassword={setconfirmpassword}  label="Confirm new password"/>
            <SaveButton onClick={submitPassworfConfig}  loading={isSaving} label='SAVE CHANGES' />
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

        </div>
    );
};

export default Authentification;