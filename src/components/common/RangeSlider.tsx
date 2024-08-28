
interface SiderParams {
    label : string, 
     value : number,
     max : number
    setValue : React.Dispatch<React.SetStateAction<number>>;
  }
  
  const Slider = (props : SiderParams) => {
    
  
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.setValue(Number(e.target.value));
    };
  
 
    return (
      <div>
        <label className="block mb-1 text-md font-medium text-black ">{props.label}</label>
        <div className="flex items-center ">
          <input
            type="range"
            value={props.value}
            min="0"
            max={props.max}
            onChange={handleSliderChange}
            className="w-full  bg-red-100 rounded-md  cursor-white  mr-4"
          />
          <input
            type="number"
            readOnly
            value={props.value}
            className="  w-14 h-8 pl-2 text-md rounded-md  text-black  border border-gray-400 text-center readOnly"
          />
        </div>
      </div>
  
    );
  };
  
  export default Slider;
  