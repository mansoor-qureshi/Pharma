import React, { useState, useEffect, useMemo } from "react";
import { TextField } from "@mui/material";
import { MenuItem } from "@mui/material";
import TodayAppointmentCard from "./TodayAppointmentCard";
import NextPatientDetailsCard from "./NextPatientDetailsCard";
import DonutChart from "react-donut-chart";
// import { Doughnut } from 'react-chartjs-2';

import useRecentAppointment from "../../hooks/useRecentAppointment";
import Spinner from "../../custom/Spinner";
import {
  getAccessToken,
  getStartAndEndDates,
  getLoggedInUser,
} from "../../common/businesslogic";
import { basePath } from "../../constants/ApiPaths";
import axios from "axios";
import "./TodayAppointmentCard.css";

const { startDate: start, endDate: end } = getStartAndEndDates();
const getTodayDate = () => {
  const today = new Date();
  const startDate = today.toISOString().split("T")[0];
  return startDate;
};

const Customer = () => {
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [selectedOption, setSelectedOption] = React.useState("");
  const [dashboardData, setDashBoardData] = useState({});
  const [internalLoader, setInternalLoader] = useState(false);
  const [nextPatientId, setNextPatientId] = useState("");

  const [startDateForAppointment, endDateForAppointment] = useMemo(() => {
    const todayDate = getTodayDate();
    return [todayDate, todayDate];
  }, []);

  const { isLoading, appointments } = useRecentAppointment(
    startDateForAppointment,
    endDateForAppointment
  );
  const loggedInUser = getLoggedInUser();

  useEffect(() => {
    setSelectedOption("doctor");
  }, []);

  useEffect(() => {
    getOpsOnSelect();
  }, [startDate, endDate, selectedOption]);

  useEffect(() => {
    if (appointments.length > 0) {
      setNextPatientId(appointments[0]?.patient?.id);
    }
  }, [appointments]);

  const getOpsOnSelect = async () => {
    try {
      setInternalLoader(true);
      const accessToken = getAccessToken();
      const queryParams = {
        start_date: startDate,
        end_date: endDate,
      };

      if (loggedInUser?.role !== "doctor") {
        if (selectedOption === "department") {
          queryParams.department_wise_op = true;
        } else {
          queryParams.doctor_wise_op = true;
        }
      }

      const response = await axios.get(
        `${basePath}/patient/dashboard/doctorop`,
        {
          params: queryParams,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setDashBoardData(response.data);
    } catch (error) {
      console.error("Error in getting ops in dashboard", error);
    } finally {
      setInternalLoader(false);
    }
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleStartDateChange = (event) => {
    const value = event.target.value;
    setStartDate(value);
  };

  const handleEndDateChange = (event) => {
    const value = event.target.value;
    setEndDate(value);
  };

  return (
    <>
      {/* {isLoading && <Spinner />} */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
        <div className="md:col-span-4">
          <div className="md:col-span-4 flex flex-col justify-start gap-4">
            <div className="flex flex-col gap-3 w-100">
              <div className="flex gap-2">
                <TextField
                  label="From"
                  type="date"
                  name="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="cursor-pointer"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ width: "100%" }}
                />
                <TextField
                  label="End"
                  type="date"
                  name="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="cursor-pointer"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ width: "100%" }}
                />
              </div>
              {loggedInUser?.role !== "doctor" && (
                <TextField
                  select
                  label="Select an option"
                  value={selectedOption}
                  onChange={handleOptionChange}
                  variant="outlined"
                  sx={{ width: "50%" }}
                >
                  <MenuItem disabled value="">
                    Select an option
                  </MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="department">Department</MenuItem>
                </TextField>
              )}
            </div>
            <div className="flex mt-5">
              <MyChart
                internalLoader={internalLoader}
                dashboardData={dashboardData}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:col-span-6 md:grid grid-cols-2">
          <TodayAppointmentCard
            appointments={appointments}
            isLoading={isLoading}
          />
          <NextPatientDetailsCard
            nextPatientId={nextPatientId}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default Customer;

const MyChart = ({ internalLoader, dashboardData }) => {
  // Data for the chart
  const loggedInUser = getLoggedInUser();
  const [data, setData] = useState([]);
  // if (Object.keys(data).length === 0) return <p>no data</p>

  useEffect(() => {
    if (loggedInUser.role === "doctor") {
      const newData = dashboardData?.op_count?.map((obj) => {
        return {
          label: obj.status,
          value: obj.count,
        };
      });
      setData(newData);
    } else {
      const newData = Object.entries(dashboardData?.op_count || {}).map(
        ([key, count]) => {
          return {
            label: key,
            value: count,
          };
        }
      );
      setData(newData);
    }
  }, [dashboardData]);

  // const data = [
  //     { label: 'A', value: 10 },
  //     { label: 'B', value: 20 },
  //     { label: 'C', value: 30 },
  // ];

  const colors = [
    "#2196F3",
    "#1976D2",
    "#1565C0",
    "#0D47A1",
    "#82B1FF",
    "#64B5F6",
    "#42A5F5",
    "#1E88E5",
    "#448AFF",
    "#2979FF",
    "#0091EA",
    "#0288D1",
    "#03A9F4",
    "#0288D1",
    "#039BE5",
    "#00ACC1",
    "#00BCD4",
    "#00B8D4",
    "#00B0FF",
    "#0097A7",
    "#00BFA5",
    "#00B8D4",
    "#00E5FF",
    "#00E5FF",
    "#00E5FF",
    "#00E5FF",
    "#00E5FF",
    "#00E5FF",
    "#00E5FF",
    "#00E5FF",
  ];

  if (data?.length === 0) {
    return (
      <div className="w-full">
        <span className="flex justify-center items-center text-[18px]">
          Ops not available ...
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: "300px", height: "300px" }}>
      {!internalLoader && data?.length > 0 && (
        <DonutChart
          data={data}
          width={400}
          height={400}
          innerRadius={0.5}
          colors={colors}
          labelStyle={{ fontSize: "26px" }}
          className="flex justify-center gap-2 text-[14px]"
        />
      )}
    </div>
  );
};
