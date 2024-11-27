import React, { useState, useEffect } from "react";
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
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import PatientStatusForm from "./PatientStatusForm";
import { getAgeFromDate } from "../../utils/customUtils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {highlightText} from '../../common/searchInput'
const PatientList = ({ patientList, isLoading, searchTerm }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const filteredPatients = patientList.filter((patient) => {
    return Object.values(patient).some((value) => {
      if (value === null || value === undefined || typeof value === "number") {
        return false; // Skip null, undefined, or numeric values
      }
      return value.toString().toLowerCase().includes(filter.toLowerCase());
    });
  });

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  const handlePatientStatus = () => {
    setOpenModal(true);
  };

  const getLocalDate = (dateString) => {
    const date = new Date(dateString);
    const localDateString = date.toLocaleDateString();
    return localDateString;
  };
  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Patient ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>First Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Last Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Mobile Number</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Age</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Joined Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton height={20} />
                    </TableCell>
                  </TableRow>
                ))
              : paginatedPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="hover:bg-blue-100 cursor-pointer"
                  >
                    <TableCell>
                      <Link
                        to={`/patient-history/${patient.id}`}
                        className="text-blue-500"
                      >
                        {highlightText(patient.patient_id, searchTerm)}
                      </Link>
                    </TableCell>
                    <TableCell>{patient?.first_name ?? "-"}</TableCell>
                    <TableCell>{patient?.last_name ?? "-"}</TableCell>
                    <TableCell>{highlightText(patient?.mobile_number ?? "-", searchTerm)}</TableCell>
                    <TableCell>{getAgeFromDate(patient.dob)}</TableCell>
                    <TableCell>
                      {patient.gender ? patient.gender : "N/A"}
                    </TableCell>
                    <TableCell>
                      {patient?.created_at
                        ? getLocalDate(patient?.created_at)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
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
      {openModal && (
        <PatientStatusForm
          open={openModal}
          handleClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
};

export default PatientList;
