import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Snackbar,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { Pagination } from "@mui/material";

import { useParams } from "react-router-dom"; // Import useParams hook
import axios from "axios";

import PrescriptionDialog from "./PrescriptionDialog11";
import ViewPrescription from "./ViewPrescription";
import Profile from "../user/Profile";
import usePatientDetailsById from "../../hooks/usePatientDetailsById";
import { basePath } from "../../constants/ApiPaths";
import PatientStatusForm from "../patients/PatientStatusForm";
import { getLoggedInUser } from "../../common/businesslogic";
import { getAccessToken } from "../../common/businesslogic";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";

const PatientDetailsComponent = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { id } = useParams(); // Get the patient ID from the URL
  const [appointments, setAppointments] = useState([]);
  const [transcription, setTranscription] = useState("");
  const [selectedAppointmentID, setSelectedAppointmentID] = useState();
  const [viewPrescription, setViewPrescription] = useState(false);
  const [openPrescription, setOpenPrescription] = useState(false);

  const [selectedAppointmentData, setSelectedAppointmentData] = useState();
  const [generatePrescription, setGeneratePrescription] = useState();
  const [statsOpen, setStatsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);

  const SpeechRecognization =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognization();

  const loggedInUser = getLoggedInUser();

  useEffect(() => {
    getPatientDetails();
  }, [id]);

  const getPatientDetails = async () => {
    const accessToken = getAccessToken();
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/patient/read/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setPatientDetails(response.data);
    } catch (error) {
      console.error("Error in fetching patient details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPrescription = async (appointmentID) => {
    try {
      const response = await axios.get(
        `${basePath}/patient/prescription/s3-url/${appointmentID}`
      );
      if (response.data?.s3_url) {
        window.open(response.data.s3_url, "_blank");
      } else {
        toast.error("something went wrong");
      }
    } catch (error) {
      console.error("error in getting s3 url", error);
      toast.error(error.response.data?.error);
    }
  };

  const handleGeneratePrescription = (appoint_id) => {
    setOpenPrescription(true);
    setSelectedAppointmentID(appoint_id);
  };

  const sendTranscription = (data) => {
    setTranscription(data);
  };

  const refresh = () => {
    getPatientDetails();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleStats = (appointmentId) => {
    setSelectedAppointmentID(appointmentId);
    setStatsOpen(true);
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = patientDetails?.all_appointments?.slice(
    startIndex,
    endIndex
  );

  return (
    <div>
      <div className="mb-4">
        <Profile userId={id} role="patient" />
      </div>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6">Appointments</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Visit Doctor</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>BP</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Temperature (C)
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Weight (KG)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Prescription</TableCell>
                {loggedInUser?.role === "admin" && (
                  <TableCell sx={{ fontWeight: "bold" }}>Stats</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                    <TableRow key={`${index}-skeleton-campaign`}>
                      <TableCell colSpan={8}>
                        <Skeleton height={20} />
                      </TableCell>
                    </TableRow>
                  ))
                : paginatedUsers?.map((appointment, index) => (
                    <TableRow key={index}>
                      <TableCell>{appointment.date ?? ""}</TableCell>
                      <TableCell>
                        {appointment?.start_time} - {appointment?.end_time}
                      </TableCell>
                      <TableCell>
                        {appointment.doctor
                          ? appointment.doctor.user.username
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {appointment?.body_details?.blood_pressure
                          ? appointment.body_details.blood_pressure
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {appointment?.body_details?.temperature
                          ? appointment.body_details.temperature
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {appointment?.body_details?.weight
                          ? appointment.body_details.weight
                          : "-"}
                      </TableCell>
                      {loggedInUser?.role === "doctor" && (
                        <TableCell>
                          {appointment?.prescription_url ? (
                            <Button
                              onClick={() =>
                                handleViewPrescription(appointment?.id)
                              }
                              variant="outlined"
                              color="primary"
                            >
                              View Prescription
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                handleGeneratePrescription(appointment.id)
                              }
                              variant="contained"
                            >
                              Generate Prescription
                            </Button>
                          )}
                        </TableCell>
                      )}
                      {(loggedInUser?.role === "admin" ||
                        loggedInUser?.role === "pharmacist") && (
                        <TableCell>
                          <Button
                            onClick={() =>
                              handleViewPrescription(appointment?.id)
                            }
                            variant="contained"
                            disabled={
                              appointment?.prescription_url ? false : true
                            }
                          >
                            View Prescription
                          </Button>
                        </TableCell>
                      )}
                      {loggedInUser?.role === "admin" && (
                        <TableCell>
                          <Button
                            onClick={() => handleStats(appointment.id)}
                            variant="contained"
                            disabled={appointment?.body_details}
                          >
                            Add Stat
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={Math.ceil(
            patientDetails?.all_appointments?.length / rowsPerPage
          )}
          page={page}
          onChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          style={{ marginTop: 20 }}
        />
      </Paper>

      {openPrescription && (
        <PrescriptionDialog
          openPrescription={openPrescription}
          setOpenPrescription={setOpenPrescription}
          setViewPrescription={setViewPrescription}
          setGeneratePrescription={setGeneratePrescription}
          sendTranscription={(data) => sendTranscription(data)}
          appointmentID={selectedAppointmentID}
          selectedAppointmentData={selectedAppointmentData}
        />
      )}

      {viewPrescription && (
        <ViewPrescription
          viewPrescription={viewPrescription}
          setViewPrescription={setViewPrescription}
          transcription={transcription}
          appointmentID={selectedAppointmentID}
          refresh={refresh}
        />
      )}

      {statsOpen && (
        <PatientStatusForm
          open={statsOpen}
          handleClose={() => setStatsOpen(false)}
          appointmentID={selectedAppointmentID}
          refresh={refresh}
        />
      )}
    </div>
  );
};

export default PatientDetailsComponent;
