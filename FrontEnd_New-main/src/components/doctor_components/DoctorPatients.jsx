import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Grid,
  css,
} from "@mui/material";
import { Pagination } from "@mui/material";
import apiConfig from "../../apiConfig";
import { basePath } from "../../constants/ApiPaths";
import { getAccessToken } from "../../common/businesslogic";
import { CiSearch } from "react-icons/ci";
import { useSearch } from "../../context/SearchContext";

const PatientList = ({ patientList }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("");
  // const [searchTerm, setSearchTerm] = useState("");
  const { searchTerm, setSearchTerm } = useSearch();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };
  const highlightText = (text, search) => {
    if (!search) return text; // If no search term, return original text
    const parts = text.split(new RegExp(`(${search})`, "gi")); // Split the text by the search term
    return parts.map((eachPart, index) =>
      eachPart.toLowerCase() === search.toLowerCase() ? (
        <span key={index} className="text-blue-600 font-bold">
          {eachPart}
        </span>
      ) : (
        eachPart
      )
    );
  };
  const filteredPatients = patientList.filter((patient) => {
    if (!searchTerm) return true;
    const patientId = patient.patient.patient_id
      ? patient.patient.patient_id.toString().trim().toLowerCase()
      : "";
    const mobileNumber = patient.patient.mobile_number
      ? patient.patient.mobile_number.toString().trim().toLowerCase()
      : "";
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    // Check if either patient ID or mobile number contains the search term
    return (
      patientId.includes(trimmedSearchTerm) ||
      mobileNumber.includes(trimmedSearchTerm)
    );
  });

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);
  const handleChange = (e) => {
    const value = e.target.value;
    const digitCount = (value.match(/\d/g) || []).length;

    // Allow letters and numbers, but restrict digits to a maximum of 12
    if (digitCount <= 12) {
      setSearchTerm(value);
    }
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="flex">
        <div className="relative">
          <input
            type="text "
            className="border h-10 rounded-md w-80 px-3"
            placeholder="search here"
            value={searchTerm}
            onChange={handleChange}
          />
          <CiSearch className="absolute right-3 top-3" />
        </div>
      </div>
      {filteredPatients.length === 0 ? (
        <div className="font-bold text-[18px] flex justify-center mt-5">
          No patients found matching the search!
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Patient ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Patient Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Mobile Number</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Age</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Appointment Time
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Last Visit Date
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Last Visit Doctor
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPatients.map((patient) => {
                const patientId = patient.patient.patient_id
                  ? patient.patient.patient_id.toString()
                  : "";
                const mobileNumber = patient.patient.mobile_number
                  ? patient.patient.mobile_number.toString()
                  : "";
                return (
                  <TableRow
                    key={patient.id}
                    className="hover:bg-blue-100 cursor-pointer"
                  >
                    <TableCell>
                      <Link
                        to={`/patient-history/${patient.patient.id}`}
                        className="text-blue-500"
                      >
                        {highlightText(patientId, searchTerm)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {patient.patient.first_name} {patient.patient.last_name}
                    </TableCell>
                    <TableCell>
                      {highlightText(mobileNumber, searchTerm)}
                    </TableCell>
                    <TableCell>
                      {patient.patient.age ? patient.patient.age : "-"}
                    </TableCell>
                    <TableCell>
                      {patient.patient.gender ? patient.patient.gender : "-"}
                    </TableCell>
                    <TableCell>
                      {patient.start_time ? patient.start_time : "-"}
                    </TableCell>
                    <TableCell>
                      {patient.last_patient_visit_date
                        ? patient.last_patient_visit_date
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {patient.last_visit_doctor_name
                        ? patient.last_visit_doctor_name
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Pagination
        count={Math.ceil(filteredPatients.length / rowsPerPage)}
        page={page}
        onChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

// const getTodayDates = () => {
//   const date = new Date();
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   const oneWeekBefore = new Date(date)
//   const
//   return { start: `${year}-${month}-${day}`, end: `${year}-${month}-${day}` };
// };

const getTodayDates = () => {
  const today = new Date();
  const oneWeekBefore = new Date(today);
  oneWeekBefore.setDate(today.getDate() - 7);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return { start: formatDate(oneWeekBefore), end: formatDate(today) };
};

const DoctorPatients = () => {
  const { start, end } = getTodayDates();

  const initialStartDate = localStorage.getItem("startDate") || start;
  const initialEndDate = localStorage.getItem("endDate") || end;

  const [assignedPatients, setAssignedPatients] = useState([]);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("startDate");
      localStorage.removeItem("endDate");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  // useEffect(() => {
  //   // Save startDate and endDate to localStorage whenever they change
  //   localStorage.setItem("startDate", startDate);
  //   localStorage.setItem("endDate", endDate);
  // }, [startDate, endDate]);
  useEffect(() => {
    // When component mounts, reset dates to today's date
    setStartDate(start);
    setEndDate(end);
    localStorage.removeItem("startDate");
    localStorage.removeItem("endDate");
  }, []);
  useEffect(() => {
    getPatientData();
  }, [startDate, endDate]);
  const getPatientData = async () => {
    try {
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
      <div className="mt-5">
        {assignedPatients?.length === 0 ? (
          <div className="font-bold text-[18px] flex justify-center">
            No Patients Available in selected Date Range !...
          </div>
        ) : (
          <PatientList patientList={assignedPatients} />
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;
