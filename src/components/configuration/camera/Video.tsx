import { useEffect, useState } from "react";
import Select from "../../common/Select";
import TextField from "../../common/TextField";
import SaveButton from "../../common/SaveButton";
import { VideoResoltionOptions, VideoEncodingOptions, RateControlModeOptions, VideoProfileOptions } from "./Options";
import axios from "axios";
import Toast from "../../common/Toast";





const Video = () => {

    const [videoResolution, setVideoResolution] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [videoEncoding, setVideoEncoding] = useState('');
    const [videoFPS, setVideoFPS] = useState(20);
    const [videoBitrate, setVideoBitrate] = useState(4096);
    const [rateControlMode, setRateControlMode] = useState('');
    const [videoProfile, setVideoProfile] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' 
    });



    const submitVideoConfig = async () => {
        try {
            const actionUrl = 'cgi-bin/mj-settings_new.cgi';
            setIsSaving(true)

            const payload = {
                action: 'update_restart',
                _video0_enabled: true,
                _video0_codec: videoEncoding,
                _video0_size: videoResolution,
                _video0_fps: videoFPS,
                _video0_bitrate: videoBitrate,
                _video0_rcMode: rateControlMode,
                _video0_profile: videoProfile,

            }

            const response = await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            if (response.data.includes('success')) {
                setToast({ message:  'Configuration Updated', type: 'success' });
                setIsSaving(false)
            } else {
                setToast({ message:  'Error Updating Configuration', type: 'error' });
                setIsSaving(false)
            }
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error', type: 'error' });
            setIsSaving(false)
        }
    };

    const getData = async () => {
        const response = await axios.get(
            "/api/v1/config.json"
        );
        const data = response.data.video0

        setVideoResolution(data.size);
        setVideoEncoding(data.codec);
        setVideoFPS(data.fps);
        setVideoBitrate(data.bitrate);
        setRateControlMode(data.rcMode);
        setVideoProfile(data.profile);

    }
    useEffect(() => {
        getData()

    }, [])

    return (
        <div className={`space-y-2

            w-full   /* Default for mobile */
            sm:w-1/2 /* Tablet size (640px and up) */
            md:w-1/3 /* Desktop size (768px and up) */
            lg:w-1/4 /* Larger screens (1024px and up) */
           `}
        >
            <Select label="Video Resolution" value={videoResolution} setValue={setVideoResolution} options={VideoResoltionOptions}labelClassName="text-black" />
            <Select label="Video Encoding" value={videoEncoding} setValue={setVideoEncoding} options={VideoEncodingOptions} labelClassName="text-black" />
            <TextField label="Frame rate (FPS)" value={videoFPS} placeholder="20" setValue={setVideoFPS} labelClassName="text-black " />
            <TextField label="Video Bitrate" value={videoBitrate} placeholder="4096" setValue={setVideoBitrate} labelClassName="text-black" />
            <Select label="Rate control mode" value={rateControlMode} setValue={setRateControlMode} options={RateControlModeOptions} labelClassName="text-black" />
            <Select label="Video Profile" value={videoProfile} setValue={setVideoProfile} options={VideoProfileOptions} labelClassName="text-black" />
            <SaveButton onClick={submitVideoConfig}  loading={isSaving} label='SAVE CHANGES' />
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />


        </div>
    );
};

export default Video;