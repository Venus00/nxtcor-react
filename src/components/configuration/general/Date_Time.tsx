"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Select from "../../common/Select"
import TextField from "../../common/TextField"
import SaveButton from "../../common/SaveButton"
import { TZ } from "./Options"
import axios from "axios"
import Toast from "../../common/Toast"

const Date_Time: React.FC = () => {
  const [timezone, setTimezone] = useState("")
  const [primaryNTP, setPrimaryNTP] = useState("")
  const [secondaryNTP, setSecondaryNTP] = useState("")
  const [date, setDate] = useState({ year: 0, month: 0, day: 0 })
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" }>({
    message: "",
    type: "info", // Default type, can be 'success', 'error', or 'info'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const syncToBrowser = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    console.log("browser timezone", tz)
    setTimezone(tz)
  }

  const getData = async () => {
    try {
      const response = await axios.get("/cgi-bin/j/datetime.cgi")
      const currentDate = new Date(Number.parseInt(response.data.time_now) * 1000)

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const day = currentDate.getDate()
      const hours = currentDate.getHours()
      const minutes = currentDate.getMinutes()
      const seconds = currentDate.getSeconds()

      setDate({ year, month, day })
      setTime({ hours, minutes, seconds })
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const getTimezone = async () => {
    try {
      const response = await axios.get("/cgi-bin/j/ntpTZ.cgi")
      setTimezone(response.data.tz_name)
      setPrimaryNTP(response.data.server_0)
      setSecondaryNTP(response.data.server_1)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      getData()
    }, 1000)
    getTimezone()
    return () => clearInterval(interval)
  }, [])

  const getOffset = (value: unknown) => {
    const zone = TZ.find((zone) => zone.value === value)
    return zone ? zone.offset : null // Return the offset or null if not found
  }
  const handleSave = async () => {
    try {
      const actionUrl = "cgi-bin/fw-time.cgi"

      setIsSaving(true)

      const payload = {
        action: "update",
        tz_name: timezone,
        tz_data: getOffset(timezone),
        server_0: primaryNTP,
        server_1: secondaryNTP,
      }

      const response = await axios.post(actionUrl, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (response.status === 200) {
        setToast({ message: "Settings Updated successfully", type: "success" })
      } else {
        setToast({ message: `Unexpected status code: ${response.status}`, type: "error" })
      }
    } catch (error) {
      console.error("Error updating Time configuration:", error)
      setToast({ message: "Error updating settings.", type: "error" })
    }
  }

  const SyncNTP = async () => {
    const actionUrl = "/cgi-bin/j/time.cgi"
    setIsSyncing(true)
    try {
      const response = await axios.get(actionUrl, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (response.status === 200) {
        setToast({ message: response.data.message, type: "success" })
        setIsSyncing(false)
      } else {
        setToast({ message: `Unexpected status code: ${response.status}`, type: "error" })
        setIsSyncing(false)
      }
    } catch (error) {
      console.log(error)
      setIsSyncing(false)
      setToast({ message: "Error syncing NTP.", type: "error" })
    }
  }

  return (
  <div className="space-y-4 w-1/4 text-sm">
  <div className="space-y-3">
    {/* Device Date Section */}
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-black mr-2">Camera Date</label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          id="date_year"
          className="bg-gray-50 border border-gray-300 text-center text-sm text-gray-900 rounded-md w-[70px] p-1.5"
          readOnly
          value={date.year || "----"}
        />
        <div className="text-sm">-</div>
        <input
          type="text"
          id="date_month"
          className="bg-gray-50 border border-gray-300 text-center text-sm text-gray-900 rounded-md w-[60px] p-1.5"
          readOnly
          value={date.month || "--"}
        />
        <div className="text-sm">-</div>
        <input
          type="text"
          id="date_day_num"
          className="bg-gray-50 border border-gray-300 text-center text-sm text-gray-900 rounded-md w-[60px] p-1.5"
          readOnly
          value={date.day || "--"}
        />
      </div>
    </div>

    {/* Device Time Section */}
    <div className="flex items-center space-x-2">
      <label className="text-sm font-semibold text-black mr-2">Camera Time</label>
      <div className="flex items-center space-x-1">
        <input
          type="text"
          id="time_hour"
          className="bg-gray-50 border border-gray-300 text-center text-sm text-gray-900 rounded-md w-[65px] p-1.5"
          readOnly
          value={time.hours || "00"}
        />
        <div className="text-sm p-1">:</div>
        <input
          type="text"
          id="time_minute"
          className="bg-gray-50 border border-gray-300 text-center text-sm text-gray-900 rounded-md w-[55px] p-1.5"
          readOnly
          value={time.minutes || "00"}
        />
        <div className="text-sm p-1">:</div>
        <input
          type="text"
          id="time_second"
          className="bg-gray-50 border border-gray-300 text-center text-sm text-gray-900 rounded-md w-[55px] p-1.5"
          readOnly
          value={time.seconds || "00"}
        />
      </div>
    </div>
  </div>

  <Select label="Timezone" value={timezone} setValue={setTimezone} options={TZ}  />

  <button
    type="button"
    onClick={syncToBrowser}
    className="text-blue-500 bg-blue-200 hover:bg-blue-500 hover:text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm p-2 w-full"
  >
    Sync to Browser Timezone
  </button>

  <TextField
    label="Primary NTP server"
    value={primaryNTP}
    placeholder="0.time.openipc.org"
    setValue={setPrimaryNTP}
  />
  <TextField
    label="Secondary NTP server"
    value={secondaryNTP}
    placeholder="1.time.openipc.org"
    setValue={setSecondaryNTP}
  />

  <button
    type="button"
    onClick={SyncNTP}
    className="text-blue-500 bg-blue-200 hover:bg-blue-500 hover:text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm p-2 w-full"
  >
    {isSyncing ? "Syncing ..." : " Sync to NTP Server"}
  </button>

  <SaveButton onClick={handleSave} loading={isSaving} label="SAVE CHANGES"  />

  {/* Render Toast */}
  <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
</div>

  )
}

export default Date_Time
