import { useEffect, useState } from "react";
import TextField from "../../common/TextField";
import axios from "axios";

const Identification = () => {

    const [deviceName, setdeviceName] = useState("");
    const [deviceIP, setdeviceIP] = useState("");
    const [deviceMAC, setdeviceMAC] = useState("");
    const [webVersion, setWebVersion] = useState("");

    const  getData = async() =>{
        const response = await axios.get(
            "/cgi-bin/general_info.cgi"
          );
    
          // Log the response from the API to the console
          console.log("response", response);
          setdeviceName(response.data.network_hostname.toUpperCase());
          setdeviceIP(response.data.network_address);
          setdeviceMAC(response.data.network_macaddr.toUpperCase());
          setWebVersion(response.data.fw_version);
    

      }
 

    useEffect(()=>{
        getData()

    },[])


    return (
        <div className={`space-y-4
            w-full   /* Default for mobile */
            sm:w-1/2 /* Tablet size (640px and up) */
            md:w-1/3 /* Desktop size (768px and up) */
            lg:w-1/4 /* Larger screens (1024px and up) */
           `}
        >

            <TextField label="Device name" value={deviceName} placeholder=""  />
            <TextField label="Device IP" value={deviceIP} placeholder=""  />
            <TextField label="Device MAC" value={deviceMAC} placeholder="" />
            <TextField label="Web version" value={webVersion} placeholder="" />

             </div>
    );
};

export default Identification;