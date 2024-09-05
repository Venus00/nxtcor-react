import { useEffect, useState } from 'react';
import Slider from './../../common/RangeSlider';
import Toggle from '../../common/Toggle';
import Select from '../../common/Select';
import SaveButton from '../../common/SaveButton';
import { RecordingFormatOptions, AudioSamplingRateOptions } from "./Options"
import axios from 'axios';
import Toast from '../../common/Toast';



const Audio = () => {
    const [isCheckedMicro, setIsCheckedMicro] = useState(true);
    const [Volume, setVolume] = useState(30);
    const [recordingFormat, setRecordingFormat] = useState('');
    const [audioSamplingRate, setaudioSamplingRate] = useState('');
    const [isCheckedSpeaker, setIsCheckedSpeaker] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [SpeakerVolume, setSpeakerVolume] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' // Default type, can be 'success', 'error', or 'info'
    });





    const submitAudioConfig = async () => {
        try {
            const actionUrl = 'cgi-bin/mj-settings_new.cgi';

            setIsSaving(true)
            const payload = {
                action: 'update_restart',
                _audio_enabled: isCheckedMicro,
                _audio_volume: Volume,
                _audio_srate: audioSamplingRate,
                _audio_codec: recordingFormat,
                _audio_outputEnabled: isCheckedSpeaker,
                _audio_outputVolume: SpeakerVolume,
                _audio_speakerPin: '',
                _audio_speakerPinInvert: false
            }

            const response = await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });


            if (response.data.includes('success')) {
                setToast({ message: 'Configuration Updated', type: 'success' });
                setIsSaving(false)
            } else {
                setToast({ message: 'Error Updating Configuration ', type: 'error' });
                setIsSaving(false)
            }
        } catch (error) {
            setIsSaving(false)
            setToast({ message: 'Error .', type: 'error' });
        }
    };

    const getData = async () => {
        const response = await axios.get(
            "/api/v1/config.json"
        );
        const data = response.data.audio
        // Log the response from the API to the console
        console.log("response", response);
        setIsCheckedMicro(data.enabled);
        setVolume(data.volume);
        setRecordingFormat(data.codec);
        setaudioSamplingRate(data.srate);;
        setIsCheckedSpeaker(data.outputEnabled);
        setSpeakerVolume(data.outputVolume);



    }


    useEffect(() => {
        getData()

    }, [])

    return (
        <div className={`space-y-4 
            w-full   /* Default for mobile */
            sm:w-1/2 /* Tablet size (640px and up) */
            md:w-1/3 /* Desktop size (768px and up) */
            lg:w-1/4 /* Larger screens (1024px and up) */
           `}
        >
            <Toggle label="Enable Microphone" value={isCheckedMicro} setValue={setIsCheckedMicro} />
            {
                isCheckedMicro &&
                <>
                    <Slider label="Input Volume" value={Volume} setValue={setVolume} max={30} />
                    <Select label="Audio Sampling Rate" value={audioSamplingRate} setValue={setaudioSamplingRate} options={AudioSamplingRateOptions} />
                    <Select label="Codec for RTSP and MP4 encoding" value={recordingFormat} setValue={setRecordingFormat} options={RecordingFormatOptions} /></>
            }
            <Toggle label="Enable Speaker" value={isCheckedSpeaker} setValue={setIsCheckedSpeaker} />
            {
                isCheckedSpeaker && <Slider label="Line Out" value={SpeakerVolume} setValue={setSpeakerVolume} max={30} />

            }
            <SaveButton onClick={submitAudioConfig}  loading={isSaving}  label='SAVE CHANGES' />
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

        </div>
    );
};

export default Audio;
