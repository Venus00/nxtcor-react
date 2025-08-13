
import { useEffect, useState } from "react";
import TextField from "../../common/TextField";
import Toggle from "../../common/Toggle";
import SaveButton from "../../common/SaveButton";
import Toast from "../../common/Toast";
import axios from "axios";


const Binding = () => {
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPassword, setSenderPassword] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [emailsubject, setEmailSubject] = useState("");
  const [isCheckedSnapshot, setIsCheckedSnapshot] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
    message: '',
    type: 'info' // Default type, can be 'success', 'error', or 'info'
  });


  const submitMotionConfig = async () => {
    const actionUrl = "/cgi-bin/binding_post.cgi"

    const payload = {
      senderEmail,
      senderPassword,
      receiverEmail,
      emailsubject,
      isCheckedSnapshot
    };
    try {
      const response = await axios.post(actionUrl, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status === 'success') {

        setToast({ message: response.data.message, type: 'success' });
      } else {

        setToast({ message: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.log(error)
      setToast({ message: 'Error ', type: 'error' });
    }
  };
  const getData = async () => {
    const response = await axios.get(
      "/cgi-bin/email.cgi"
    );
    const data = response.data
    // Log the response from the API to the console
    console.log("response", response);
    setIsCheckedSnapshot(data.snapshot);
    setEmailSubject(data.emailsubject);
    setSenderEmail(data.senderEmail);
    setSenderPassword(data.senderPassword);;
    setReceiverEmail(data.receiverEmail);


  }


  useEffect(() => {
    getData()

  }, [])
  return (
    <div>
      <div className="w-3/4 grid grid-cols-2 gap-4 p-6">
        <TextField label=" Sender Email" value={senderEmail} setValue={setSenderEmail} placeholder="xxxxx@gmail.com" isEditable={true} />
        <TextField label="Sender Password" value={senderPassword} setValue={setSenderPassword} placeholder="*********" isEditable={true} />
        <TextField label="Receiver Email" value={receiverEmail} setValue={setReceiverEmail} placeholder="xxxxx@gmail.com" isEditable={true} />
        <TextField label="Email Subject" value={emailsubject} setValue={setEmailSubject} placeholder="Motion Alert" isEditable={true} />
        <Toggle label="Attach Snapshot" value={isCheckedSnapshot} setValue={setIsCheckedSnapshot} />

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

export default Binding;
