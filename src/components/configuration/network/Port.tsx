import { useState } from "react";

import SaveButton from "../../common/SaveButton";


import Toggle from "../../common/Toggle";

import TextField from "../../common/TextField";


const Port = () => {

    const [isCheckedHTTP, setIsCheckedHTTP] = useState(true);
    const [HTTP, setHTTP] = useState(80);
    const [isCheckedHTTPS, setIsCheckedHTTPS] = useState(true);
    const [HTTPS, setHTTPS] = useState(443);
    const [isCheckedRTSP, setIsCheckedRTSP] = useState(true);
    const [RTSP, setRTSP] = useState(445);
    const [isCheckedNTP, setIsCheckedNTP] = useState(true);
    const [NTP, setNTP] = useState(123);


    function handleSave() {
        const json = {

            HTTP: HTTP,

        }
        console.log('You clicked submit.', json);
    }

    return (
        <div className={`  grid grid-cols-2    gap-4
          w-full   /* Default for mobile */
          sm:w-1/2 /* Tablet size (640px and up) */
          md:w-1/3 /* Desktop size (768px and up) */
          lg:w-2/4 /* Larger screens (1024px and up) */
         `}
        >

            <Toggle label="HTTP" value={isCheckedHTTP} setValue={setIsCheckedHTTP} />
            <div className={`${isCheckedHTTP ? 'block' : 'invisible'} `}>
                <TextField label="Port" value={HTTP} setValue={setHTTP} placeholder="" />
            </div>
            <Toggle label="HTTPS" value={isCheckedHTTPS} setValue={setIsCheckedHTTPS} />
            <div className={`${isCheckedHTTPS ? 'block' : 'invisible'} `}>
                <TextField label="Port" value={HTTPS} setValue={setHTTPS} placeholder="" />
            </div>

            <Toggle label="RTSP" value={isCheckedRTSP} setValue={setIsCheckedRTSP} />
            <div className={`${isCheckedRTSP ? 'block' : 'invisible'} `}>
                <TextField label="Port" value={RTSP} setValue={setRTSP} placeholder="" />
            </div>

            <Toggle label="NTP" value={isCheckedNTP} setValue={setIsCheckedNTP} />
            <div className={`${isCheckedNTP ? 'block' : 'invisible'} `}>
                <TextField label="Port" value={NTP} setValue={setNTP} placeholder="" />
            </div>





            <SaveButton onClick={handleSave} label='SAVE CHANGES' />

        </div>
    );
};

export default Port;