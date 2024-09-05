import { useEffect, useState } from "react";
import Select from "../../common/Select";
import SaveButton from "../../common/SaveButton";


import Toggle from "../../common/Toggle";

import TextField from "../../common/TextField";
import axios from "axios";
import Toast from "../../common/Toast";

const networkInterfaceOptions = [
    { value: "eth0", label: "eth0" }

];
const NetworkAccess = () => {

    const [isCheckedDHCP, setIsCheckedDHCP] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [networkInterface, setnetworkInterface] = useState('eth0');
    const [ipv4Address, setipv4Address] = useState('');
    const [ipv4Mask, setipv4Mask] = useState('');
    const [ipv4Gateway, setipv4Gateway] = useState('');
    const [ipv6Address, setipv6Address] = useState('');
    const [ipv6Mask, setipv6Mask] = useState('');
    const [ipv6Gateway, setipv6Gateway] = useState('');
    const [primaryDns, setprimaryDns] = useState('');
    const [secondaryDns, setsecondaryDns] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
        message: '',
        type: 'info' // Default type, can be 'success', 'error', or 'info'
    });


    const submitNetworkConfig = async () => {
        try {
            const actionUrl = '/cgi-bin/fw-network_new.cgi'; // Replace with your actual URL

            setIsSaving(true)
            const payload = {
                action: 'update',
                network_interface: networkInterface,
                network_dhcp: isCheckedDHCP,
                network_address: ipv4Address,
                network_netmask: ipv4Mask,
                network_gateway: ipv4Gateway,
                network_nameserver: primaryDns

            }

            const response = await axios.post(actionUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });


            if (response.data.includes('success')) {
                setToast({ message: 'Configuration Updated', type: 'success' });
                setIsSaving(false)
            } else {
                setToast({ message: 'Error Updating Configuration ', type: 'error' });
                setIsSaving(false)
            }
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error .', type: 'error' });
            setIsSaving(false)
        }
    };
    const getData = async () => {
        const response = await axios.get(
            "/cgi-bin/get_network.cgi"
        );
        // Log the response from the API to the console
        console.log("response", response);
        setIsCheckedDHCP(response.data.dhcp === "" ? false : true)
        setipv4Address(response.data.ip_address);
        setipv4Mask(response.data.mask);
        setipv4Gateway(response.data.gateway);
        setprimaryDns(response.data.dns_p);
        setsecondaryDns(response.data.dns_s);
    }


    useEffect(() => {
        getData()

    }, [])
    return (
        <div className={`  space-y-4
          w-full   /* Default for mobile */
          sm:w-1/2 /* Tablet size (640px and up) */
          md:w-1/3 /* Desktop size (768px and up) */
          lg:w-3/4 /* Larger screens (1024px and up) */
         `}
        >
            <div className="grid grid-cols-3    gap-4">
                <Select label="Network Interface" value={networkInterface} setValue={setnetworkInterface} options={networkInterfaceOptions} />
                <Toggle label="Enable DHCP" value={isCheckedDHCP} setValue={setIsCheckedDHCP} />
            </div>
            <div className={`${isCheckedDHCP ? 'hidden' : 'block'} `} >
                <div className="text-xl font-semibold  mb-3">IPv4</div>
                <div className="grid grid-cols-3    gap-10">
                    <TextField label="IP address" value={ipv4Address} setValue={setipv4Address} placeholder="192.168.10.22"      isEditable={true}/>
                    <TextField label="Subnet mask" value={ipv4Mask} setValue={setipv4Mask} placeholder="255.255.255.0"     isEditable={true} />
                    <TextField label="Gatway" value={ipv4Gateway} setValue={setipv4Gateway} placeholder="192.168.10.254"      isEditable={true} />
                </div>
            </div>
            <div className={`${isCheckedDHCP ? 'hidden' : 'hidden'} `} >
                <div className="text-xl font-semibold  mb-3">IPv6</div>
                <div className="grid grid-cols-3    gap-10">
                    <TextField label="IP address" value={ipv6Address} setValue={setipv6Address} placeholder="192.168.10.22"       isEditable={true}/>
                    <TextField label="Subnet mask" value={ipv6Mask} setValue={setipv6Mask} placeholder="255.255.255.0"      isEditable={true}/>
                    <TextField label="Gatway" value={ipv6Gateway} setValue={setipv6Gateway} placeholder="192.168.10.254"      isEditable={true} />
                </div>
            </div>


            <div className={`${isCheckedDHCP ? 'hidden' : 'block'} `} >
                <div className="text-xl font-semibold mb-3">DNS server</div>
                <div className="grid grid-cols-3    gap-10">
                    <TextField label="Prefered DNS server " value={primaryDns} setValue={setprimaryDns} placeholder="8.8.8.8"      isEditable={true}/>
                    <TextField label="Alternate DNS server " value={secondaryDns} setValue={setsecondaryDns} placeholder="8.8.8.8"      isEditable={true} />
                </div>
            </div>

            <SaveButton onClick={submitNetworkConfig}  loading={isSaving} label='SAVE CHANGES' />
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />


        </div >
    );
};

export default NetworkAccess;