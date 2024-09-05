import { useState } from 'react';
import Toggle from '../../common/Toggle';
import TextField from '../../common/TextField';
// import SaveButton from '../../common/SaveButton';

const Security_Service = () => {
    const [isCheckedSSH, setIsCheckedSSH] = useState(false);
    const [SSHport, setSSHport] = useState('22');

    // function handleSave() {
    //     const json = {

    //         HTTP: 'HTTP',

    //     }
    //     console.log('You clicked submit.', json);
    // }



    return (
        <div className='space-y-4 w-1/4 '>
            <Toggle label="Enable SSH" value={isCheckedSSH} setValue={setIsCheckedSSH} />
            {
                isCheckedSSH &&
                <TextField label="SSH Port" value={SSHport} placeholder="****" setValue={setSSHport} />

            }
            {/* <SaveButton onClick={handleSave} label='SAVE CHANGES' /> */}
        </div>

    );
};

export default Security_Service;
