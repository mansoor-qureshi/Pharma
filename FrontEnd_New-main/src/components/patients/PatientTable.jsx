import React, { useState, useEffect } from "react";
import { Button, Grid, css } from "@mui/material";
import { Pagination } from "@mui/material";
import apiConfig from "../../apiConfig";
import axios from "axios";
import CreatePatientForm from "../patientForm/PatientForm";
import AppointmentDialog from "../patientForm/AppointmentDialog";

import { basePath } from "../../constants/ApiPaths";
import Spinner from "../../custom/Spinner";
import PatientList from "./PatientList";
import { CiSearch } from "react-icons/ci";
import { SearchInput } from "../../common/searchInput";
import { useSearch } from "../../context/SearchContext";

const PatientTable = () => {
  const [patientList, setPatientList] = useState([]);
  const [open, setOpen] = useState(false); // State to control dialog visibility
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { searchTerm } = useSearch();

  useEffect(() => {
    getPatientData();
  }, []);

  const getPatientData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/patient`);
      setPatientList(response.data);
    } catch (error) {
      console.error("error while retriveing patients Info:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const filteredPatients = patientList.filter((eachPatient) => {
    if (!searchTerm) return true;

    // When there is a search term, check against patient ID and mobile number
    const patientId = eachPatient?.patient_id
      ? eachPatient.patient_id.toString().trim().toLowerCase()
      : "";
    const mobileNumber = eachPatient?.mobile_number
      ? eachPatient.mobile_number.toString().trim().toLowerCase()
      : "";
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    // Check if either patient ID or mobile number contains the search term
    return (
      patientId.includes(trimmedSearchTerm) ||
      mobileNumber.includes(trimmedSearchTerm)
    );
  });
  const handleCreateUserClick = () => {
    setOpen(true); // Open the dialog when "Create New User" button is clicked
  };

  const handleClose = () => {
    setOpen(false);
    setAppointmentOpen(false);
  };
  const handleAppointmentClick = () => {
    setAppointmentOpen(true);
  };

  const refresh = () => {
    getPatientData();
  };
  return (
    <div className="bg-[#ffffff] p-3">
      {/* {isLoading && <Spinner />} */}
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className="relative">
           
            <SearchInput />
          
          </div>
          <div className="flex gap-2">
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateUserClick}
            >
              Create Patient
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAppointmentClick}
              style={{ marginLeft: "10px" }}
            >
              Schedule Appointment
            </Button>
          </div>
        </div>
        <div className="mt-10">
          {filteredPatients.length === 0 ? (
            <div className="font-bold text-[18px] flex justify-center mt-5">
              No patients found matching the search!
            </div>
          ) : (
            <PatientList
              patientList={filteredPatients}
              isLoading={isLoading}
              searchTerm={searchTerm}
            />
          )}

          {!isLoading && patientList?.length === 0 && (
            <div className="font-bold text-[20px] flex justify-center mt-32">
              No Patients Available
            </div>
          )}
        </div>
      </div>

      {appointmentOpen && (
        <AppointmentDialog
          open={appointmentOpen}
          handleClose={handleClose}
          refresh={refresh}
        />
      )}
      {open && (
        <CreatePatientForm
          open={open}
          handleClose={handleClose}
          refresh={refresh}
        />
      )}
    </div>
  );
};

export default PatientTable;
