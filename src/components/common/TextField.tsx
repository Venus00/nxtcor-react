interface TextFieldParams {
  label: string;
  value: number | string;
  placeholder: string;
  setValue?: React.Dispatch<React.SetStateAction<string>> | React.Dispatch<React.SetStateAction<number>>;
  isEditable?: boolean;
  labelClassName?: string; // <-- Ajout ici
}

const TextField: React.FC<TextFieldParams> = (props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (typeof props.value === 'number' && typeof props.setValue === 'function') {
      const numericValue = Number(newValue);
      if (!isNaN(numericValue)) {
        (props.setValue as React.Dispatch<React.SetStateAction<number>>)(numericValue);
      }
    } else if (typeof props.setValue === 'function') {
      (props.setValue as React.Dispatch<React.SetStateAction<string>>)(newValue);
    }
  };

  return (
    <div>
      <label className={`block mb-1 text-sm font-medium ${props.labelClassName ?? "text-black"}`}>
        {props.label}
      </label>
      <input
        type="text"
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 ${!props.isEditable ? 'bg-gray-200 cursor-not-allowed' : ''}`}
        placeholder={props.placeholder}
        value={props.value}
        onChange={handleChange}
        disabled={!props.isEditable}
      />
    </div>
  );
};

export default TextField;