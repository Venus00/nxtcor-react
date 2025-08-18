"use client"

import { useEffect, useState } from "react"
import TextField from "../../common/TextField"
import axios from "axios"
import Toast from "../../common/Toast"

const Identification = () => {
  const [deviceName, setdeviceName] = useState("")
  const [deviceIP, setdeviceIP] = useState("")
  const [deviceMAC, setdeviceMAC] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [webVersion, setWebVersion] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" }>({
    message: "",
    type: "info", // Default type, can be 'success', 'error', or 'info'
  })

  const getData = async () => {
    const response = await axios.get("/cgi-bin/general_info.cgi")
    // Log the response from the API to the console
    console.log("response", response)
    setdeviceName(response.data.network_hostname.toUpperCase())
    setdeviceIP(response.data.network_address)
    setdeviceMAC(response.data.network_macaddr.toUpperCase())
    setWebVersion(response.data.fw_version)
  }

  useEffect(() => {
    getData()
  }, [])
  const handelCameraNameChange = async () => {
    const actionUrl = "/cgi-bin/general_info_post.cgi"
    setIsSaving(true)
    const payload = {
      network_hostname: deviceName,
    }
    try {
      const response = await axios.post(actionUrl, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (response.data.includes("success")) {
        setIsSaving(false)
        setToast({ message: "Name changed successufuly", type: "success" })
      } else {
        setIsSaving(false)
        setToast({ message: "Not valid : Empty value", type: "error" })
      }
    } catch (error) {
      setIsSaving(false)
      setToast({ message: "Error ", type: "error" })
    }
  }

  return (
    <div className="space-y-4 bg-gray-800 text-white p-6 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-1/4">
          <TextField
            label="Camera name"
            value={deviceName}
            setValue={setdeviceName}
            placeholder=""
            isEditable={true}
            labelClassName="text-white" 
          />
        </div>
        <button
          className="h-11 w-36 px-6 mt-6 py-1 bg-blue-300 text-white font-medium text-md rounded hover:bg-blue-500 flex items-center justify-center"
          onClick={handelCameraNameChange}
        >
          {isSaving ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          ) : (
            "Change"
          )}
        </button>
      </div>

      <div className="w-1/4 space-y-4">
        <TextField label="Camera IP" value={deviceIP} placeholder="" isEditable={false}labelClassName="text-white" />
        <TextField label="Camera MAC" value={deviceMAC} placeholder="" isEditable={false} labelClassName="text-white" />
        <TextField label="Web version" value={webVersion} placeholder="" isEditable={false} labelClassName="text-white" />
      </div>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
    </div>  )
}

export default Identification
