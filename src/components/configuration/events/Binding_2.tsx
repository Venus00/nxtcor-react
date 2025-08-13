import React, { useState } from 'react';
import EmailModal from './EmailModal';
import HttpPostModal from './HttpPostModal';


const Binding: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'email' | 'http' | 'mqtt' | null>(null);

  // Email Modal State
  const [enabled_email, setEnabled_email] = useState<boolean>(false);
  const [senderEmail, setSenderEmail] = useState<string>("");
  const [senderPassword, setSenderPassword] = useState<string>("");
  const [receiverEmail, setReceiverEmail] = useState<string>("");
  const [emailsubject, setEmailSubject] = useState<string>("");
  const [isCheckedSnapshot, setIsCheckedSnapshot] = useState<boolean>(false);

  // HTTP POST Modal State
  const [enabled_http, setEnabled_http] = useState<boolean>(false);
  const [httpUrl, setHttpUrl] = useState<string>("");
  const [httpMethod, setHttpMethod] = useState<string>("POST");



  const openModal = (modalType: 'email' | 'http' | 'mqtt') => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const saveChanges = () => {
    // Implement save logic here
    setActiveModal(null);
    console.log('Saving changes...');
  };

  return (
    <div className="p-6 flex flex-col items-center w-3/4 mt-24">
      <div className="flex gap-4 mb-6  ">
        <button
          onClick={() => openModal('email')}
          className={`px-4 py-2 rounded ${enabled_email ? 'bg-green-500 text-white' : 'bg-gray-300'} ${activeModal === 'email' ? 'border-2 border-green-700' : ''}`}
        >
          Email
        </button>
        <button
          onClick={() => openModal('http')}
          className={`px-4 py-2 rounded ${enabled_http ? 'bg-green-500 text-white' : 'bg-gray-300'} ${activeModal === 'http' ? 'border-2 border-green-700' : ''}`}
        >
          HTTP Post
        </button>
      </div>

      <EmailModal
        isOpen={activeModal === 'email'}
        onClose={closeModal}
        onSave={saveChanges}
        senderEmail={senderEmail}
        senderPassword={senderPassword}
        receiverEmail={receiverEmail}
        emailsubject={emailsubject}
        isCheckedSnapshot={isCheckedSnapshot}
        setSenderEmail={setSenderEmail}
        setSenderPassword={setSenderPassword}
        setReceiverEmail={setReceiverEmail}
        setEmailSubject={setEmailSubject}
        setIsCheckedSnapshot={setIsCheckedSnapshot}
        enabled={enabled_email}
        setEnabled={setEnabled_email}
      />

      <HttpPostModal
        isOpen={activeModal === 'http'}
        onClose={closeModal}
        onSave={saveChanges}
        url={httpUrl}
        setUrl={setHttpUrl}
        method={httpMethod}
        setMethod={setHttpMethod}
        enabled={enabled_http}
        setEnabled={setEnabled_http}
      />


    </div>
  );
};

export default Binding;
