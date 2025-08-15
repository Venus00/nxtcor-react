interface ToggleParams {
    label: string;
    value: boolean;
    setValue: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
  const Toggle: React.FC<ToggleParams> = (props) => {
    const handleToggle = () => {
      props.setValue(!props.value);
    };
  
    return (
      <div >
        {/* Label at the top */}
        <label className="block mb-1 text-md font-medium text-white pb-4">
          {props.label}
        </label>
  
        {/* LED, Status Text, and Toggle Switch in one row */}
        <div className="flex items-center justify-between ml-4">
          <div className="flex items-center space-x-4">
            {/* LED Indicator */}
            <div
              className={`w-3 h-3  rounded-full ${props.value ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
  
            {/* Status Text */}
            <span className="text-md  font-medium">
              {props.value ? 'ON' : 'OFF'}
            </span>
          </div>
  
          {/* Toggle Switch */}
          <div
            className={`relative w-9 h-5  bg-gray-200 rounded-full cursor-pointer transition-colors ${props.value ? 'bg-sky-800' : ''}`}
            onClick={handleToggle}
          >
            <div
              className={`absolute bg-white border border-gray-300 rounded-full transition-transform ${props.value ? 'transform translate-x-full ' : ''} w-5 h-5 `}
            />
          </div>
        </div>
      </div>
    );
  };
  
  export default Toggle;
  