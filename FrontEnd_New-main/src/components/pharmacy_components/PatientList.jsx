import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
  Box,
} from "@mui/material";
import { Pagination } from "@mui/material";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import { toast } from "react-toastify";
import { basePath } from "../../constants/ApiPaths";
import Spinner from "../../custom/Spinner";
import Skeleton from "react-loading-skeleton";
import { highlightText } from "../../common/searchInput";
import BuyPage from "./BuyPage";
import { useSelector } from "react-redux";
import { FaRegEye } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";

const PatientList = ({ patientList, refresh, searchTerm }) => {

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isData, setIsData] = useState([]);
  const [isOpeningPrescription, setIsOpeningPrescription] = useState(false);

  const navigate = useNavigate();
  const handleTaxInvoice = async (appointmentID) => {
    try {
      const response = await axios.get(
        `${basePath}/inventory/pharmacyinvoice/s3-url/${appointmentID}`
      );
      if (response.data?.s3_url) {
        window.open(response.data.s3_url, "_blank");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
  };

  const handleViewPrescription = async (appointmentID) => {
    try {
      setIsOpeningPrescription(true);
      const response = await axios.get(
        `${basePath}/patient/prescription/s3-url/${appointmentID}`
      );
      if (response.data?.s3_url) {
        window.open(response.data.s3_url, "_blank");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Error in getting s3 url", error);
      toast.error(error.response?.data?.error);
    } finally {
      setIsOpeningPrescription(false);
    }
  };

  const handleBuyNavigate = async (id) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/inventory/medicines`);
      if (response?.data?.results) {
        setIsData(response?.data?.results);
        navigate(`/buy-page/${id}`, {
          state: {
            medicineCategoryDetails: response.data.results,
            appointment_id: id,
          },
        });
      } else {
        toast.error("Failed to fetch medicines.");
      }
    } catch (error) {
      console.log("Error: ", error.message);
      toast.error("An error occurred while fetching medicines.");
    } finally {
      setIsLoading(false);
    }
  };

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
        return false;
      }
      return value.toString().toLowerCase().includes(filter.toLowerCase());
    });
  });

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-5">
      {isOpeningPrescription && <Spinner />}
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
              <TableCell sx={{ fontWeight: "bold" }}>Last Visit Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Last Visit Doctor
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={10}>
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
                        to={`/patient-history/${patient.patient.id}`}
                        className="text-blue-500"
                      >
                        {highlightText(patient.patient.patient_id, searchTerm)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {highlightText(patient.patient.first_name, searchTerm)}{" "}
                      {highlightText(patient.patient.last_name, searchTerm)}
                    </TableCell>
                    <TableCell>
                      {highlightText(
                        patient.patient.mobile_number ?? "-",
                        searchTerm
                      )}
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
                    <TableCell>
                      <Button
                        onClick={() => handleViewPrescription(patient?.id)}
                        variant="contained"
                        disabled={patient?.prescription_url ? false : true}
                      >
                        <FaRegEye size={20} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          patient.invoice
                            ? handleTaxInvoice(patient.id)
                            : handleBuyNavigate(patient.id)
                        }
                      >
                        {patient.invoice ? <FaRegFilePdf size={20} /> : "Buy"}
                      </Button>
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
      {isData.length > 0 && <BuyPage medicineCategoryDetails={isData} />}
    </div>
  );
};

export default PatientList;
