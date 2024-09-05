

interface SaveParams {
    label: string;
    onClick: () => void;
    loading: boolean;
}

const SaveButton = (props: SaveParams) => {
    return (
        <button
            type="button"
            onClick={props.onClick}
            className="flex items-center justify-center text-white text-md font-bold bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-md p-4"
            disabled={props.loading}
        >
            {props.loading ? (
                <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Saving...
                </>
            ) : (
                props.label
            )}
        </button>
    );
};

export default SaveButton;
