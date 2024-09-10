
import { useEffect, useState } from "react";
import Slider from "../../common/RangeSlider";
import SaveButton from "../../common/SaveButton";
import axios from "axios";
import Toast from "../../common/Toast";



const Configuration = () => {
  const [Sensitivity, setSensitivity] = useState<number>(30);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
    message: '',
    type: 'info' // Default type, can be 'success', 'error', or 'info'
  });
  const submitMotionConfig = async () => {
    const actionUrl = "/cgi-bin/mj-settings_new.cgi"

    const payload = {

      _motionDetect_enabled: true,
      _motionDetect_visualize: false,
      _motionDetect_debug: false,
      _motionDetect_roi: '',
      _motionDetect_sensitivity: Sensitivity,
      action: 'update_restart'
    };
    try {
      const response = await axios.post(actionUrl, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.includes('success')) {

        setToast({ message: 'Sensitvity saved successufuly', type: 'success' });
      } else {

        setToast({ message: 'Error', type: 'error' });
      }
    } catch (error) {
      console.log(error)
      setToast({ message: 'Error ', type: 'error' });
    }
  };

  const getData = async () => {
    const response = await axios.get(
      "/api/v1/config.json"
    );
    const data = response.data.motionDetect
    // Log the response from the API to the console
    console.log("response", response);
    setSensitivity(data.sensitivity);

  }


  useEffect(() => {
    getData()

  }, [])

  return (
    <div>
      <div className="w-1/3 p-6 space-y-12 ">
        <Slider label="Sensitivity" value={Sensitivity} setValue={setSensitivity} max={8} />
        {/* <Slider label="delay between Notifications (min)" value={Delay} setValue={setDelay} max={15} /> */}

      </div>
      <div className="flex flex-col items-center justify-center gap-4 w-3/4 mt-4">
  
        <div>
          <SaveButton onClick={submitMotionConfig} label="SAVE CHANGES" loading={false} />
        </div>
      </div>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
    </div>
  );
};




export default Configuration;