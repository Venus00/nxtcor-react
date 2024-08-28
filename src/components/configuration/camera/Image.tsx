import { useEffect, useState } from "react";
import Select from "../../common/Select";
import SaveButton from "../../common/SaveButton";

import { ImageRotationOptions } from "./Options";
import Toggle from "../../common/Toggle";
import Slider from "../../common/RangeSlider";
import axios from "axios";

const Image = () => {

    const [brightness, setbrightness] = useState(20);
    const [contrast, setcontrast] = useState(20);
    const [hue, sethue] = useState(20);
    const [saturation, setsaturation] = useState(20);
    const [isFlipH, setIsFlipH] = useState(false);
    const [isFlipV, setIsFlipV] = useState(false);
    const [rotation, setrotation] = useState('');





    const submitImageConfig = async () => {
        try {
            const actionUrl = 'cgi-bin/mj-settings.cgi'; // Replace with your actual URL


            const payload = {
                action: 'update',
                _image_mirror: isFlipH,
                _image_flip: isFlipV,
                _image_rotate: rotation,
                _image_contrast: contrast,
                _image_hue: hue,
                _image_saturation: saturation,
                _image_luminance: brightness,
                _video0_gopSize: 1.0,
                _video0_crop: '',
                _video0_sliceUnits: 0
            }

            await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            await axios.post(actionUrl, { action: 'restart' }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });


        } catch (error) {
            console.error('Error updating network configuration:', error);
        }
    };

    const getData = async () => {
        const response = await axios.get(
            "/api/v1/config.json"
        );
       const data = response.data.image
        // Log the response from the API to the console
        console.log("response", response.data.image);                                         
        setbrightness       (data.luminance);                             
        setcontrast         (data.contrast);                             
        sethue              (data.hue);                             
        setsaturation       (data.saturation);                             
        setIsFlipH          (data.mirror);                             
        setIsFlipV          (data.flip);                             
        setrotation         (data.rotate);                             
    }


    useEffect(() => {
        getData()

    }, [])


    return (
        <div className="space-y-4">
            <div className={`  grid grid-cols-2    gap-6
          w-full   /* Default for mobile */
          sm:w-1/2 /* Tablet size (640px and up) */
          md:w-1/3 /* Desktop size (768px and up) */
          lg:w-2/4 /* Larger screens (1024px and up) */
         `}
            >
                <Slider label="Brightness (0-100)" value={brightness} setValue={setbrightness} max={100} />
                <Slider label="Hue level (0-100)" value={hue} setValue={sethue} max={100} />
                <Slider label="Contrast (0-100)" value={contrast} setValue={setcontrast} max={100} />
                <Slider label="Saturation (0-100)" value={saturation} setValue={setsaturation} max={100} />
                <Toggle label="Flip image Horizontally" value={isFlipH} setValue={setIsFlipH} />
                <Toggle label="Flip image Vertically" value={isFlipV} setValue={setIsFlipV} />
                <Select label="Rotate Image Clockwise" value={rotation} setValue={setrotation} options={ImageRotationOptions} />

            </div>
            <SaveButton onClick={submitImageConfig} label='SAVE CHANGES' />
        </div>
    );
};

export default Image;