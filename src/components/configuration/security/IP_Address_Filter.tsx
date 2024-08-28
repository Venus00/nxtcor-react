import { useState } from 'react';

const IP_Address_Filter = () => {
    const [isChecked, setIsChecked] = useState(false);


    const handleToggle = () => {
        setIsChecked(!isChecked);
    };

    return (
        <div className='space-y-4 '>
            <label className="inline-flex  cursor-pointer gap-10   ">
                <span className=" text-sm font-medium text-gray-700 ">
                    Enable IP Address Filter
                </span>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleToggle}
                    className="sr-only peer"
                />
                <div
                    className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none   rounded-full peer ${isChecked ? 'peer-checked:bg-blue-500' : 'peer-dark:bg-gray-700'}`}
                >
                    <div
                        className={`absolute top-[2px] ${isChecked ? '-translate-x-half' : 'translate-x-full'} left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform`}
                    />
                </div>

            </label>

            <form className="w-1/6">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">IP address filter type</label>
                <select id="countries" className="bg-gray-50 border border-gray-300 text-gray-900 text-md font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    <option value="restricted">Restricted</option>
                    <option value="restricted">Restricted</option>
                </select>
            </form>
            <button type="button" className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-md text-md px-5 py-2.5 me-2 mb-2 ">SAVE CHANGES</button>
        </div>
    );
};

export default IP_Address_Filter;
