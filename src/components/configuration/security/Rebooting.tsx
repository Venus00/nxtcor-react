import axios from "axios";

const Rebooting = () => {
    const handleReboot = () => {
        // Trigger reboot action
        axios.get("/cgi-bin/fw-restart.cgi")
            .then(response => {
                console.log('Reboot triggered:', response.data);
                // Optionally handle the response
                // Refresh the page after rebooting
                window.location.reload();
            })
            .catch(error => {
                console.error('Error triggering reboot:', error);
            });
    };



    return (
        <div className="space-y-4 w-3/4 flex justify-center flex-col">


            <p className="text-black text-xl">Reboot camera to apply new settings and reset temporary files.</p>
            <button
                onClick={handleReboot}
                className="px-6 py-3  w-1/6  bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
                Reboot
            </button>

        </div>

    );
};

export default Rebooting;
