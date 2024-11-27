import React, { useEffect, useState } from "react";
import axios from "axios";
import apiConfig from "../../apiConfig";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
} from "@mui/material";
import { IoClose } from "react-icons/io5";
import { basePath } from "../../constants/ApiPaths";
import { toast } from "react-toastify";
import Spinner from "../../custom/Spinner";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import Autocomplete from "@mui/material/Autocomplete";
import usePatientSearch from "../../hooks/usePatientSearch";
import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popper,
} from "@mui/material";

const AppointmentDialog = ({ open, handleClose, refresh }) => {
  const [doctorsList, setDoctorsList] = useState([]);
  // const [patientList, setPatientList] = useState([])

  const [doctorAvailability, setDoctorsAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState(null);
  const [appointmentSlots, setAppointmentSlots] = useState([]);
  const [selectedAppointmentTime, setSelectedAppointmentTime] = useState("");
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedSearchType, setSelectedSearchType] = useState("name");

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const { isLoading: patientSearchLoading, patientList } = usePatientSearch(
    searchValue,
    300
  );

  useEffect(() => {
    fetchDoctors();
    // fetchPatients()
    return () => {
      clearFormData();
    };
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDoctor !== "") {
      getDoctorAvailability(selectedDoctor);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    setSearchResults([...patientList]);
  }, [patientList]);

  const clearFormData = () => {
    setSelectedDoctor("");
    setSelectedPatient("");
    setSelectedAppointmentDate(null);
    setSelectedAppointmentTime("");
  };

  const disableDob = (date) => {
    return date > new Date();
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${basePath}/doctor/create`);
      setDoctorsList(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const getDoctorAvailability = async (id) => {
    try {
      const response = await axios.get(`${basePath}/doctor/availability/${id}`);
      setDoctorsAvailability(response.data);
    } catch (error) {
      console.error("Error fetching doctor availability:", error);
    }
  };

  const validateAppointment = () => {
    if (selectedPatient === null) {
      toast.warn("please choose patient");
      return true;
    }
    if (selectedDoctor === "") {
      toast.warn("please choose doctor");
      return true;
    }
    if (selectedDoctor !== "") {
      if (selectedAppointmentDate == null) {
        toast.warn("please select Appointment date");
        return true;
      }
      if (selectedAppointmentTime == "") {
        toast.warn("please select Appointment time");
        return true;
      }
    }
    return false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const appointmentError = validateAppointment();

    if (appointmentError) return;

    try {
      setIsLoading(true);

      const slot = selectedAppointmentTime.split("-");
      const appointmetPayload = {
        doctor: selectedDoctor,
        patient: selectedPatient?.id,
        date: selectedAppointmentDate.format("YYYY-MM-DD"),
        start_time: slot[0],
        end_time: slot[1],
      };
      const appointmentResponse = await axios.post(
        `${basePath}/patient/appointment/`,
        appointmetPayload
      );
      toast.success("Appointment created successfully");

      refresh();
      handleClose();
      clearFormData();
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        const errorObject = error.response.data;
        Object.keys(errorObject).map((key) => {
          toast.error(errorObject[key][0]);
          return;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSelectedDoctor(value);
  };

  const handleDateChange = (name, date) => {
    setSelectedAppointmentDate(date);
    const formattedDate = date.format("YYYY-MM-DD");
    const selectedDate = doctorAvailability.filter(
      (dateObj) => dateObj.date == formattedDate
    );
    setAppointmentSlots(selectedDate[0].slots);
  };

  const handleSlotChange = (index, time) => {
    console.log(index, time);
    setSelectedAppointmentTime(time);
    setSelectedSlotIndex(index);
  };

  const isAllowedDate = (day) => {
    return doctorAvailability.some((allowedDate) =>
      day.isSame(allowedDate.date, "day")
    );
  };

  const renderDay = (day, _selectedDate, _isInCurrentMonth, dayComponent) => {
    const highlightColor = isAllowedDate(day) ? "blue" : "inherit";
    return React.cloneElement(dayComponent, {
      style: { backgroundColor: highlightColor },
    });
  };

  const handleInputValueChange = (event, value) => {
    setSearchValue(value);
  };

  const getFullName = (patientDetails) => {
    return (
      (patientDetails?.first_name ?? "") +
      " " +
      (patientDetails?.last_name ?? "")
    );
  };

  const handleSelectedSearchValue = (value) => {
    setSelectedPatient(value);
  };

  return (
    <div>
      {isLoading && <Spinner />}
      <Dialog
        PaperProps={{ style: { width: "600px" } }}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle className="flex justify-between">
          <span>Schedule Appointment</span>
          <IoClose size={24} onClick={handleClose} className="cursor-pointer" />
        </DialogTitle>
        <DialogContent className="mt-3">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              {/* <TextField
                                    label="search Type"
                                    fullWidth
                                    select
                                    name="search"
                                    value={selectedSearchType}
                                    onChange={(e) => setSelectedSearchType(e.target.value)}
                                    sx={{ width: '50%' }}
                                >
                                    <MenuItem value="name">Name</MenuItem>
                                    <MenuItem value="phoneNumber">PhoneNumber</MenuItem>
                                </TextField> */}

              <Autocomplete
                value={selectedPatient}
                onChange={(event, value) => {
                  handleSelectedSearchValue(value);
                }}
                inputValue={searchValue}
                onInputChange={handleInputValueChange}
                options={searchResults}
                loading={patientSearchLoading}
                getOptionLabel={(option) => getFullName(option)}
                filterOptions={(options) => options}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {patientSearchLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Doctors"
                fullWidth
                select
                name="doctor"
                value={selectedDoctor}
                onChange={handleChange}
                sx={{ width: "100%" }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 200, // Set the maximum height of the dropdown menu
                        overflowY: "auto", // Enable vertical scrolling
                      },
                    },
                  },
                }}
              >
                {doctorsList.map((doctor) => {
                  return (
                    <MenuItem
                      value={doctor.id}
                      key={doctor.id}
                      sx={{ whiteSpace: "normal" }}
                    >
                      {doctor.user.username} (specialization -{" "}
                      {doctor.specialization.name}) (Dept -{" "}
                      {doctor.department.name}) (exp - {doctor.experience}{" "}
                      years)
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>

            {selectedDoctor !== "" && (
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select Appointment"
                    value={selectedAppointmentDate}
                    onChange={(date) => handleDateChange("appointment", date)}
                    textField={(props) => <input {...props} />}
                    shouldDisableDate={(day) => !isAllowedDate(day)}
                    renderDay={renderDay}
                  />
                </LocalizationProvider>
              </Grid>
            )}
            {selectedAppointmentDate && (
              <Grid item xs={12} className="mt-10">
                <Grid container spacing={2} className="mt-16">
                  {appointmentSlots.map((slot, index) => (
                    <Grid item xs={3} key={index} spacing={2}>
                      <span
                        key={index}
                        className={
                          selectedSlotIndex === index
                            ? `bg-green-500 p-2 rounded cursor-pointer text-white`
                            : `bg-blue-500 p-2 rounded cursor-pointer text-white`
                        }
                        onClick={() =>
                          handleSlotChange(index, `${slot[0]}-${slot[1]}`)
                        }
                      >
                        {slot[0]} - {slot[1]}
                      </span>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
          <DialogActions className="flex justify-end mt-16">
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Book Appointment
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentDialog;
