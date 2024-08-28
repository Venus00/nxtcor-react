interface SaveParams {
    label: string,
    onClick: () => void;
}

const SaveButton = (props: SaveParams) => {

    return (
        <button type="button"
            onClick={props.onClick}
            className="text-white text-md font-bold  bg-red-700 hover:bg-red-800 w-fill focus:ring-4 focus:ring-red-300 font-medium rounded-md p-4 "
        >
            {props.label}
        </button>


    );
};

export default SaveButton;