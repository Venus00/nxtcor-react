import { useState } from 'react';

interface PasswordProps {
    password: string;
    setPassword: (password: string) => void;
    label?: string;  // Optional label prop
    labelClassName?: string; 
}

const Password: React.FC<PasswordProps> = ({ password, setPassword, label ,labelClassName}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="max-w-sm">
            <label className={`block mb-1 text-md font-medium${labelClassName ?? "text-black"}`}>{label}</label>
            <div className="relative">
                <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="py-3 ps-4 pe-10 block w-full bg-gray-50 border border-gray-300 rounded-lg text-md text-black fo  focus:ring-blue-500 "
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer  text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600"
                >
                    <svg
                        className="shrink-0 size-3.5"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {showPassword ? (
                            <>
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </>
                        ) : (
                            <>
                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                <line x1="2" x2="22" y1="2" y2="22"></line>
                            </>
                        )}
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Password;
