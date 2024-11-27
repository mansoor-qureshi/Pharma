import React, { useState, useEffect } from "react";
import { TextField, MenuItem } from "@mui/material";
import axios from "axios";
import { basePath } from "../../constants/ApiPaths";
import { FaFileExport } from "react-icons/fa";
import * as XLSX from "xlsx";
import AppointmentsTable from "./AppointmentsTable";
import useRecentAppointment from "../../hooks/useRecentAppointment";
import { toast } from "react-toastify";
import Spinner from "../../custom/Spinner";

const getStartAndEndDatesForAppointments = (type) => {
  const appointmentDates = { startDate: "", endDate: "" };
  const today = new Date();

  switch (type) {
    case "untill_today": {
      const startDate = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      );
      const endDate = new Date(today);
      appointmentDates.startDate = startDate.toISOString().split("T")[0];
      appointmentDates.endDate = endDate.toISOString().split("T")[0];
      break;
    }
    case "today": {
      const startDate = new Date(today);
      appointmentDates.startDate = startDate.toISOString().split("T")[0];
      appointmentDates.endDate = startDate.toISOString().split("T")[0];
      break;
    }
    case "yesterday": {
      let yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      appointmentDates.startDate = yesterday.toISOString().split("T")[0];
      appointmentDates.endDate = yesterday.toISOString().split("T")[0];
      break;
    }
    case "last_week": {
      let oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const daysToPreviousSunday = oneWeekAgo.getDay();

      const lastWeekStartDate = new Date(
        oneWeekAgo.setDate(oneWeekAgo.getDate() - daysToPreviousSunday)
      );
      let date = new Date(lastWeekStartDate);
      const lastWeekEndDate = new Date(date.setDate(date.getDate() + 6));

      appointmentDates.startDate = lastWeekStartDate
        .toISOString()
        .split("T")[0];
      appointmentDates.endDate = lastWeekEndDate.toISOString().split("T")[0];
      break;
    }
    case "last_seven_days": {
      let oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      let yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      appointmentDates.startDate = oneWeekAgo.toISOString().split("T")[0];
      appointmentDates.endDate = yesterday.toISOString().split("T")[0];
      break;
    }
    case "last_thirty_days": {
      let thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      appointmentDates.startDate = thirtyDaysAgo.toISOString().split("T")[0];
      appointmentDates.endDate = yesterday.toISOString().split("T")[0];
      break;
    }
    case "last_month": {
      let firstDayOfMonth = new Date(today);

      let currentMonth = firstDayOfMonth.getMonth();
      let currentYear = firstDayOfMonth.getFullYear();

      currentMonth -= 1;

      if (currentMonth < 0) {
        currentMonth = 11; // December
        currentYear -= 1;
      }
      firstDayOfMonth.setFullYear(currentYear, currentMonth, 1);

      let lastDayOfMonth = new Date(today);
      lastDayOfMonth.setDate(0);

      appointmentDates.startDate = firstDayOfMonth.toISOString().split("T")[0];
      appointmentDates.endDate = lastDayOfMonth.toISOString().split("T")[0];
      break;
    }
    default:
      date = today;
      break;
  }
  return appointmentDates;
};

const { startDate: defaultStartDate, endDate: defaultEndDate } =
  getStartAndEndDatesForAppointments("today");

const Report = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filters, setFilters] = useState({
    date: "today",
    appointment_status: "all",
    doctor: "all",
    specialization: "all",
    department: "all",
    prescription: "all",
  });
  const [customDates, setCustomDates] = useState({
    start_date: "",
    end_date: "",
  });
  const [appointmentDates, setAppointmentDates] = useState({
    start_date: defaultStartDate,
    end_date: defaultEndDate,
  });

  const { isLoading, appointments } = useRecentAppointment(
    appointmentDates.start_date,
    appointmentDates.end_date
  );
  useEffect(() => {
    getDoctors();
    getDepartments();
    getSpecialization();
  }, []);

  const getDoctors = async () => {
    try {
      const response = await axios.get(`${basePath}/doctor/create`);
      setDoctors(response.data);
    } catch (error) {
      console.log(`error fetching doctors in reports`, error);
    }
  };
  const getDepartments = async () => {
    try {
      const response = await axios.get(`${basePath}/doctor/department`);
      setDepartments(response.data);
    } catch (error) {
      console.log(`error fetching doctors in reports`, error);
    }
  };
  const getSpecialization = async () => {
    try {
      const response = await axios.get(`${basePath}/doctor/specialization`);
      setSpecializations(response.data);
    } catch (error) {
      console.log(`error fetching doctors in reports`, error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });

    if (name === "date") {
      if (value !== "custom") {
        const { startDate, endDate } =
          getStartAndEndDatesForAppointments(value);
        setAppointmentDates({ start_date: startDate, end_date: endDate });
      } else {
        setCustomDates({ start_date: "", end_date: "" });
        setAppointmentDates({ start_date: "", end_date: "" });
      }
    }
  };

  const handleCustomDateChange = (event) => {
    const { name, value } = event.target;
    setCustomDates({ ...customDates, [name]: value });
    setAppointmentDates({ ...appointmentDates, [name]: value });
  };

  const handleDownload = () => {
    const dataToBeDownloaded = appointments.map((appointment) => {
      const data = {
        "Patient Name": `${appointment?.patient?.first_name ?? ""} ${
          appointment?.patient?.last_name ?? ""
        }`,
        "Doctor Name": appointment?.doctor?.user?.username ?? "",
        Date: appointment?.date ?? "",
        "Start Time": appointment?.start_time ?? "",
        "End Time": appointment?.end_time ?? "",
        "Dcotor Department": appointment?.doctor?.department?.name ?? "",
        Amount: "",
        Days: "",
        Status: appointment?.status ?? "",
      };
      return data;
    });

    if (dataToBeDownloaded.length > 0) {
      const ws = XLSX.utils.json_to_sheet(dataToBeDownloaded);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, `appointmentList.xlsx`);
      toast.success("data downloaded successfully");
    }
  };

  return (
    <div className="bg-[#ffffff] w-full h-full p-5 ">
      <div className="font-bold text-[18px]">Appointment List</div>
      {/* {isLoading && <Spinner />} */}
      <div className="flex flex-col gap-5">
        <div className="flex mt-5 gap-10">
          <div className="flex flex-col gap-1">
            <label htmlFor="date" className="font-semibold">
              Select Date Range:
            </label>
            <select
              id="date"
              name="date"
              onChange={handleChange}
              value={filters.date}
              className="border rounded-md pl-3"
              style={{ height: "35px", width: "200px" }}
            >
              <option value="untill_today">Untill Today</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_week">Last Week</option>
              <option value="last_seven_days">Last 7 Days</option>
              <option value="last_thirty_days">Last 30 Days</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {filters.date === "custom" && (
            <>
              <div className="flex flex-col gap-1">
                <label htmlFor="custom_start_date" className="font-semibold">
                  From :
                </label>
                <input
                  type="date"
                  id="custom_start_date"
                  name="start_date"
                  value={customDates.start_date}
                  onChange={handleCustomDateChange}
                  className="border rounded-md pl-3"
                  style={{ height: "35px", width: "200px" }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="custom_end_date" className="font-semibold">
                  To :
                </label>
                <input
                  type="date"
                  id="custom_end_date"
                  name="end_date"
                  value={customDates.end_date}
                  onChange={handleCustomDateChange}
                  className="border rounded-md pl-3"
                  style={{ height: "35px", width: "200px" }}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-5 xl:gap-10">
          <div className="flex flex-col gap-1">
            <label htmlFor="appointment_status" className="font-semibold">
              Appointment Status:
            </label>
            <select
              id="appointment_status"
              name="appointment_status"
              onChange={handleChange}
              value={filters.appointment_status}
              className="border rounded-md pl-3"
              style={{ height: "35px", width: "200px" }}
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="unscheduled">Unscheduled</option>
              <option value="completed">Completed</option>
              <option value="ongoing">OnGoing</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="doctor" className="font-semibold">
              Doctor
            </label>
            <select
              id="doctor"
              name="doctor"
              onChange={handleChange}
              value={filters.doctor}
              className="border rounded-md pl-3"
              style={{ height: "35px", width: "200px" }}
            >
              <option value="all">All</option>
              {doctors.map((doctor) => {
                return (
                  <option key={`doctor-${doctor.id}`} value={doctor.id}>
                    {doctor?.user?.username}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="specialization" className="font-semibold">
              Specialization
            </label>
            <select
              id="specialization"
              name="specialization"
              onChange={handleChange}
              value={filters.specialization}
              className="border rounded-md pl-3"
              style={{ height: "35px", width: "200px" }}
            >
              <option value="all">All</option>
              {specializations.map((specialization) => {
                return (
                  <option
                    key={`specialization-${specialization.id}`}
                    value={specialization.id}
                  >
                    {specialization?.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="department" className="font-semibold">
              Department
            </label>
            <select
              id="department"
              name="department"
              onChange={handleChange}
              value={filters.department}
              className="border rounded-md pl-3"
              style={{ height: "35px", width: "200px" }}
            >
              <option value="all">All</option>
              {departments.map((department) => {
                return (
                  <option
                    key={`department-${department.id}`}
                    value={department.id}
                  >
                    {department?.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="prescription" className="font-semibold">
              Prescription
            </label>
            <select
              id="prescription"
              name="prescription"
              onChange={handleChange}
              value={filters.prescription}
              className="border rounded-md pl-3"
              style={{ height: "35px", width: "200px" }}
            >
              <option value="all">All</option>
              <option value="purchased">Purchased</option>
              <option value="unpurchased">UnPurchased</option>
            </select>
          </div>
        </div>
        <div className="">
          <button
            className="border p-3 bg-gray-300 rounded-md py-2"
            style={{ width: "100px" }}
          >
            Search
          </button>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex justify-end items-center">
            {/* <div className="border border-gray-500 bg-blue-100 rounded-full p-2 text-blue-600 ">About to Expiry (15)</div> */}
            {appointments.length > 0 && (
              <div className="p-3 border border-gray-500 rounded-md">
                <FaFileExport
                  className="cursor-pointer"
                  onClick={handleDownload}
                />
              </div>
            )}
          </div>
          <div>
            {appointments.length > 0 && (
              <AppointmentsTable
                appointments={appointments}
                isLoading={isLoading}
              />
            )}
            {!isLoading && appointments?.length === 0 && (
              <div className="flex justify-center font-bold text-[20px]">
                No Appointments ...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
