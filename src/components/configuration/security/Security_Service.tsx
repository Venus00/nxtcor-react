import { useState } from 'react';
import Toggle from '../../common/Toggle';
import TextField from '../../common/TextField';

const Security_Service = () => {
    const [isCheckedSSH, setIsCheckedSSH] = useState(false);
    const [SSHport, setSSHport] = useState('22');




    return (
        <div className='space-y-4 w-1/4 '>
         <Toggle label="Enable SSH" value={isCheckedSSH} setValue={setIsCheckedSSH} />
            {
                isCheckedSSH &&
                <TextField label="SSH Port" value={SSHport} placeholder="****" setValue={setSSHport} />
                    
            }
             </div>
    );
};

export default Security_Service;
