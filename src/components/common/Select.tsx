

interface SelectParams {
    label: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    options: { value: string, label: string }[];
}

const Select = (props: SelectParams) => {

    return (
        <div>
            <label className="block mb-1 text-md font-medium text-black pb-2">{props.label}</label>


            <select className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                onChange={e => props.setValue(e.target.value)}
                value={props.value}
                >

                {
                    props.options.map((opt) =>
                        <option key={opt.value} value={opt.value}>{opt.label} </option>
                    )
                }
            </select>
        </div>

    );
};

export default Select;
