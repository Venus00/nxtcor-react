"use client"

import { useEffect, useState } from "react"
import TextField from "../../common/TextField"
import axios from "axios"
import Toast from "../../common/Toast"
import Select from "../../common/Select"

const cameraTypeOptions = [
  { label: "Thermal", value: "thermal" },
  { label: "Normal", value: "normal" },
]

const Identification = () => {
  const [deviceName, setdeviceName] = useState("")
  const [deviceIP, setdeviceIP] = useState("")
  const [deviceMAC, setdeviceMAC] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [webVersion, setWebVersion] = useState("")
  const [cameraType, setCameraType] = useState("thermal")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" }>({
    message: "",
    type: "info",
  })

  const getData = async () => {
    const response = await axios.get("/cgi-bin/general_info.cgi")
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
      camera_type: cameraType,
    }
    try {
      const response = await axios.post(actionUrl, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (response.data.includes("success")) {
        setIsSaving(false)
        setToast({ message: "Name changed successfully", type: "success" })
      } else {
        setIsSaving(false)
        setToast({ message: "Not valid: Empty value", type: "error" })
      }
    } catch (error) {
      setIsSaving(false)
      setToast({ message: "Error", type: "error" })
    }
  }

  return (
    <div className="space-y-4 bg-white text-black p-6 rounded-lg gap-2">
      <div className="flex items-center space-x-4 gap-2">
  <div className="w-1/4 flex flex-col space-y-4">
  <Select
    label="Type Camera"
    value={cameraType}
    setValue={setCameraType}
    options={cameraTypeOptions}
    labelClassName="text-black"
  />
  <TextField
    label="Camera name"
    value={deviceName}
    setValue={setdeviceName}
    placeholder=""
    isEditable={true}
    labelClassName="text-black"
  />
</div>

      
      </div>

      <div className="w-1/4 space-y-4">
        <TextField label="Camera IP" value={deviceIP} placeholder="" isEditable={false} labelClassName="text-black" />
        <TextField label="Camera MAC" value={deviceMAC} placeholder="" isEditable={false} labelClassName="text-black" />
        <TextField label="Web version" value={webVersion} placeholder="" isEditable={false} labelClassName="text-black" />
        <div className="pt-4">
          <button
            type="button"
            onClick={handelCameraNameChange}
            disabled={isSaving}
            className="flex items-center justify-center text-white text-sm  bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-md p-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "SAVE CHANGES"}
          </button>
      </div>
      </div>

      {/* Render Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
    </div>
  )
}

export default Identification