import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { TextField } from "@mui/material";
import { Pagination } from "@mui/material";
import apiConfig from "../../apiConfig";
import { basePath } from "../../constants/ApiPaths";
import { getAccessToken } from "../../common/businesslogic";
import { CiSearch } from "react-icons/ci";

import PatientList from "./PatientList";
import { useSearch } from "../../context/SearchContext";
import Spinner from "../../custom/Spinner";
import { SearchInput } from "../../common/searchInput";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDates = () => {
  const today = new Date();
  const oneWeekBefore = new Date(today);
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
  return {
    start: formatDate(oneWeekBefore),
    end: formatDate(today),
  };
};

const { start, end } = getTodayDates();

const PharmaPatients = () => {
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [isLoading, setIsLoading] = useState(false);
  const { searchTerm } = useSearch();

  useEffect(() => {
    getPatientData();
  }, [startDate, endDate]);

  const getPatientData = async () => {
    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      const response = await axios.get(`${basePath}/patient/appointment/list`, {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setAssignedPatients(response.data);
    } catch (error) {
      console.error("error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === "from") {
      setStartDate(value);
    }
    if (name == "to") {
      setEndDate(value);
    }
  };

  const refresh = () => {
    getPatientData();
  };

  const filteredPatients = assignedPatients.filter((eachPatient) => {
    if (!searchTerm) return true;
    const { patient } = eachPatient;
    // When there is a search term, check against patient ID and mobile number
    const patientId = patient?.patient_id
      ? patient.patient_id.toString().trim().toLowerCase()
      : "";
    const mobileNumber = patient?.mobile_number
      ? patient.mobile_number.toString().trim().toLowerCase()
      : "";
    const patientName =
      patient?.first_name && patient?.last_name
        ? `${patient.first_name}${patient.last_name}`
            .toString()
            .trim()
            .toLowerCase()
        : "";
    const trimmedSearchTerm = searchTerm
      .trim()
      .replace(/\s+/g, "")
      .toLowerCase();

    // Check if either patient ID or mobile number contains the search term
    return (
      patientId.includes(trimmedSearchTerm) ||
      mobileNumber.includes(trimmedSearchTerm) ||
      patientName.includes(trimmedSearchTerm)
    );
  });
  return (
    <div className="mt-5 bg-[#ffffff] p-5">
      <div className="flex justify-between items-center">
        <div className="text-[16px]">
          Assigned Patients From <span className="font-bold">{startDate}</span>{" "}
          to <span className="font-bold">{endDate}</span>
        </div>
        <div className="flex gap-3">
          <TextField
            label="from"
            name="from"
            type="date"
            value={startDate}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ width: 200 }}
          />
          <TextField
            label="to"
            name="to"
            type="date"
            value={endDate}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ width: 200 }}
          />
        </div>
      </div>
      <div className="flex">
        <div className="relative">
          <SearchInput />
        </div>
      </div>
      <div className="mt-5">
        {isLoading ? (
          <Spinner />
        ) : assignedPatients.length === 0 ? (
          <div className="font-bold text-[18px] flex justify-center mt-10">
            No Patients Available!
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="font-bold text-[18px] flex justify-center mt-10">
            No Patients Found for the given search term!
          </div>
        ) : (
          <PatientList
            patientList={filteredPatients}
            refresh={refresh}
            isLoading={isLoading}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
};

export default PharmaPatients;
