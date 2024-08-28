import { useState } from "react";
import TextField from "../../common/TextField";
import SaveButton from "../../common/SaveButton";
import axios from "axios";






const Authentification = () => {


    const [password, setpassword] = useState('');
    const [confirmpassword, setconfirmpassword] = useState('');


    const submitPassworfConfig = async () => {
        try {
            const actionUrl = '/cgi-bin/fw-interface.cgi'; // Replace with your actual URL


            const payload = {
                action: 'access',
                password_default: password,
                password_confirm: confirmpassword

            }

            await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });


        } catch (error) {
            console.error('Error updating network configuration:', error);
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
            <TextField label="Username" value={'root'} placeholder="root" />
            <TextField label="New password" value={password} placeholder="****" setValue={setpassword} />
            <TextField label="Confirm new password" value={confirmpassword} placeholder="****" setValue={setconfirmpassword} />

            <SaveButton onClick={submitPassworfConfig} label='SAVE CHANGES' />

        </div>
    );
};

export default Authentification;