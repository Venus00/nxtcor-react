import { useEffect, useState } from "react";
import Select from "../../common/Select";
import TextField from "../../common/TextField";
import SaveButton from "../../common/SaveButton";
import { VideoResoltionOptions, VideoEncodingOptions, RateControlModeOptions, VideoProfileOptions } from "./Options";
import axios from "axios";





const Video = () => {

    const [videoResolution, setVideoResolution] = useState('');
    const [videoEncoding, setVideoEncoding] = useState('');
    const [videoFPS, setVideoFPS] = useState(20);
    const [videoBitrate, setVideoBitrate] = useState(4096);
    const [rateControlMode, setRateControlMode] = useState('');
    const [videoProfile, setVideoProfile] = useState('');


    const submitVideoConfig = async () => {
        try {
            const actionUrl = 'cgi-bin/mj-settings.cgi';


            const payload = {
                action: 'update',
                _video0_enabled: true,
                _video0_codec: videoEncoding,
                _video0_size: videoResolution,
                _video0_fps: videoFPS,
                _video0_bitrate: videoBitrate,
                _video0_rcMode: rateControlMode,
                _video0_profile: videoProfile,

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
            <Select label="Video Resolution" value={videoResolution} setValue={setVideoResolution} options={VideoResoltionOptions} />
            <Select label="Video Encoding" value={videoEncoding} setValue={setVideoEncoding} options={VideoEncodingOptions} />
            <TextField label="Frame rate (FPS)" value={videoFPS} placeholder="20" setValue={setVideoFPS} />
            <TextField label="Video Bitrate" value={videoBitrate} placeholder="4096" setValue={setVideoBitrate} />
            <Select label="Rate control mode" value={rateControlMode} setValue={setRateControlMode} options={RateControlModeOptions} />
            <Select label="Video Profile" value={videoProfile} setValue={setVideoProfile} options={VideoProfileOptions} />
            <SaveButton onClick={submitVideoConfig} label='SAVE CHANGES' />

        </div>
    );
};

export default Video;