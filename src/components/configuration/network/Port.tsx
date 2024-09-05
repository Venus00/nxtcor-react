import { useState } from "react";
// import SaveButton from "../../common/SaveButton";
import TextField from "../../common/TextField";


const Port = () => {


    const [HTTP, setHTTP] = useState(80);
    const [HTTPS, setHTTPS] = useState(443);
    const [RTSP, setRTSP] = useState(445);
    const [NTP, setNTP] = useState(123);


    // function handleSave() {
    //     const json = {

    //         HTTP: HTTP,

    //     }
    //     console.log('You clicked submit.', json);
    // }

    return (
        <div className={` space-y-4 w-1/4 `}
        >


            <div >
                <TextField label="HTTP port" value={HTTP} setValue={setHTTP} placeholder="" />
            </div>
            <div >
                <TextField label="HTTPS Port" value={HTTPS} setValue={setHTTPS} placeholder="" />
            </div>

            <div >
                <TextField label="RTSP Port" value={RTSP} setValue={setRTSP} placeholder="" />
            </div>

            <div >
                <TextField label="NTP Port" value={NTP} setValue={setNTP} placeholder="" />
            </div>





            {/* <SaveButton onClick={handleSave} label='SAVE CHANGES' /> */}

        </div>
    );
};

export default Port;