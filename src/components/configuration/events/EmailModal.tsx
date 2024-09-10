import React from 'react';
import Toggle from '../../common/Toggle'; // Import your Toggle component

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  senderEmail: string;
  senderPassword: string;
  receiverEmail: string;
  emailsubject: string;
  isCheckedSnapshot: boolean;
  setSenderEmail: React.Dispatch<React.SetStateAction<string>>;
  setSenderPassword: React.Dispatch<React.SetStateAction<string>>;
  setReceiverEmail: React.Dispatch<React.SetStateAction<string>>;
  setEmailSubject: React.Dispatch<React.SetStateAction<string>>;
  setIsCheckedSnapshot: React.Dispatch<React.SetStateAction<boolean>>;
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}


const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  onSave,
  senderEmail,
  senderPassword,
  receiverEmail,
  emailsubject,
  isCheckedSnapshot,
  setSenderEmail,
  setSenderPassword,
  setReceiverEmail,
  setEmailSubject,
  setIsCheckedSnapshot,
  enabled,
  setEnabled
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 ">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg border border-black">
        <button
          onClick={onClose}
          className="w-8 h-8  text-green-500 hover:text-gray-700 p-2"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Email Settings</h2>
        <div className="mb-4">
          <Toggle
            label="Enable Email"
            value={enabled}
            setValue={setEnabled}
          />
        </div>
        <div className={`space-y-4 ${enabled ? '' : 'opacity-50'}`}>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="Sender Email"
            className="w-full p-2 border rounded"
            disabled={!enabled}
          />
          <input
            type="password"
            value={senderPassword}
            onChange={(e) => setSenderPassword(e.target.value)}
            placeholder="Sender Password"
            className="w-full p-2 border rounded"
            disabled={!enabled}
          />
          <input
            type="email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            placeholder="Receiver Email"
            className="w-full p-2 border rounded"
            disabled={!enabled}
          />
          <input
            type="text"
            value={emailsubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Email Subject"
            className="w-full p-2 border rounded"
            disabled={!enabled}
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isCheckedSnapshot}
              onChange={(e) => setIsCheckedSnapshot(e.target.checked)}
              disabled={!enabled}
            />
            <span className="ml-2">Attach Snapshot</span>
          </label>
        </div>
        <button
          onClick={onSave}
          className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!enabled}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EmailModal;