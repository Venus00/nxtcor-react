
import { useEffect, useState } from "react";
import SaveButton from "../../common/SaveButton";
import Toggle from "../../common/Toggle";
import axios from "axios";




const Display = () => {

    const [isCheckedDisplayTime, setIsCheckedDisplayTime] = useState(true);

    const submitDisplayConfig = async () => {
        try {
            const actionUrl = 'cgi-bin/mj-settings.cgi'; 
    
       
            const payload = {
                _osd_enabled: isCheckedDisplayTime,
                _osd_font: '/usr/share/fonts/truetype/UbuntuMono-Regular.ttf',
                _osd_template: '%d.%m.%Y  %H:%M:%S '   ,      
                _osd_posX: 30,
                _osd_posY: 30,
                _osd_privacyMasks: '',
                action: 'update'
                
            }
    
             await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            await axios.post(actionUrl, {action: 'restart'}, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
    
           
        } catch (error) {
            console.error('Error updating network configuration:', error);
        }
    };
    
    const  getData = async() =>{
        const response = await axios.get(
            "/api/v1/config.json"
        );

          setIsCheckedDisplayTime(response.data.osd.enabled);    
      }
    

    useEffect(()=>{
        getData()
    
    },[])


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
                <div></div>


            </div>
            <SaveButton onClick={submitDisplayConfig} label='SAVE CHANGES' />
        </div>
    );
};

export default Display;