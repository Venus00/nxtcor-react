import React from 'react';

interface ModelTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ModelTab: React.FC<ModelTabProps> = ({ label, isActive, onClick }) => {
  return (
    <div
      className={`cursor-pointer p-4 text-center border rounded-t-lg ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default ModelTab;
