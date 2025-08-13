import React from 'react';
import Toggle from '../../common/Toggle'; // Import your Toggle component

interface HttpPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  method: string;
  setMethod: React.Dispatch<React.SetStateAction<string>>;
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const HttpPostModal: React.FC<HttpPostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  url,
  setUrl,
  method,
  setMethod,
  enabled,
  setEnabled
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <button onClick={onClose} className=" text-gray-500 hover:text-gray-700">
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">HTTP Post Settings</h2>
        <div className="mb-4">
          <Toggle 
            label="Enable HTTP Post" 
            value={enabled} 
            setValue={setEnabled} 
          />
        </div>
        <div className={`space-y-4 ${enabled ? '' : 'opacity-50'}`}>
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="URL" 
            className="w-full p-2 border rounded"
            disabled={!enabled}
          />
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)} 
            className="w-full p-2 border rounded"
            disabled={!enabled}
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
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

export default HttpPostModal;
