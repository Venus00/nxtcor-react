import { useEffect, useState } from "react";
import Select from "../../common/Select";
import TextField from "../../common/TextField";
import SaveButton from "../../common/SaveButton";
import { TZ } from "./Options";
import axios from "axios";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Date_Time = () => {
  const [timezone, setTimezone] = useState('');
  const [primaryNTP, setPrimaryNTP] = useState('');
  const [secondaryNTP, setSecondaryNTP] = useState('');
  const [date, setDate] = useState({ year: 0, month: 0, day: 0, dayOfWeek: "" });
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });


  const syncToBrowser = () => {

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('browser timezone', tz)
    setTimezone(tz);
  };

  const getData = async () => {
    try {

      const response = await axios.get("/cgi-bin/j/datetime.cgi");
      const currentDate = new Date(parseInt(response.data.time_now) * 1000);

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate()
      const dayOfWeek = daysOfWeek[day];
      const hours = currentDate.getHours()
      const minutes = currentDate.getMinutes()
      const seconds = currentDate.getSeconds()
      console.log('dayOfWeek', dayOfWeek)
      setDate({ year: year, month: month, day: day, dayOfWeek: dayOfWeek })
      setTime({ hours: hours, minutes: minutes, seconds: seconds })


    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const get_timezone = async () => {
    try {
      const response = await axios.get("/cgi-bin/j/ntpTZ.cgi");
      console.log("response", response);
      setTimezone((response.data.tz_name));
      setPrimaryNTP(response.data.server_0)
      setSecondaryNTP(response.data.server_1)
    } catch (error) {
      console.error('Error fetching data:', error);
    }

  }
  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      getData()
    }, 1000);
    get_timezone();
    //Clearing the interval
    return () => clearInterval(interval);
  }, []);
  function handleSave() {

    console.log('You clicked submit.', timezone);
  }

  return (
    <div className='space-y-4 w-1/4'>
      <div>
        <label className="block mb-2 text-md font-medium text-black">
          Device Date
        </label>
        <div className="flex items-center justify-between space-x-2">
          <input
            type="text"
            id="date_day"
            className="bg-gray-50 border border-gray-300 text-center text-md text-gray-900 rounded-md flex-1 p-2 w-[150px]"
            readOnly
            value={date.dayOfWeek || "Wednesday"}
          />
          <div className="text-md">-</div>
          <input
            type="text"
            id="date_year"
            className="bg-gray-50 border border-gray-300 text-center text-md text-gray-900 rounded-md w-full p-2"
            readOnly
            value={date.year || "2024"}
          />
          <div className="text-md">-</div>
          <input
            type="text"
            id="date_month"
            className="bg-gray-50 border border-gray-300 text-center text-md text-gray-900 rounded-md w-full p-2"
            readOnly
            value={date.month || "08"}
          />
          <div className="text-md">-</div>
          <input
            type="text"
            id="date_day_num"
            className="bg-gray-50 border border-gray-300 text-center text-md text-gray-900 rounded-md w-full p-2"
            readOnly
            value={date.day || "15"}
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 text-md font-semibold text-black">
          Device Time
        </label>
        <div className="flex items-center justify-between space-x-2">
          <input
            type="text"
            id="time_hour"
            className="bg-gray-50 border border-gray-300 text-center text-md text-gray-900 rounded-md w-[60px] p-2"
            readOnly
            value={time.hours || "15"}
          />
          <div className="text-md">:</div>
          <input
            type="text"
            id="time_minute"
            className="bg-gray-50 border border-gray-300 text-center text-md text-gray-900 rounded-md w-[60px] p-2"
            readOnly
            value={time.minutes || "08"}
          />
          <div className="text-md">:</div>
          <input
            type="text"
            id="time_second"
            className="bg-gray-50 border border-gray-300 text-center text-md text-gray-900 rounded-md w-[60px] p-2"
            readOnly
            value={time.seconds || "15"}
          />
          <button
            type="button"
            onClick={syncToBrowser}
            className="text-blue-500 bg-blue-200 hover:bg-blue-500 hover:text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-md p-2 w-full"
          >
            Sync to Browser
          </button>
        </div>
      </div>

      <Select label="Timezone" value={timezone} setValue={setTimezone} options={TZ} />

      <TextField label="Primary NTP server " value={primaryNTP} placeholder="0.time.openipc.org" setValue={setPrimaryNTP} />
      <TextField label="Secondary NTP server " value={secondaryNTP} placeholder="1.time.openipc.org" setValue={setSecondaryNTP} />

      <SaveButton onClick={handleSave} label='SYNC & SAVE CHANGES' />
    </div>
  );
};

export default Date_Time;
