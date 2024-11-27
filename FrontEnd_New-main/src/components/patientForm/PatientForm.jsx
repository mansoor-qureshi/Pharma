import React, { useEffect, useState } from "react";
import axios from "axios";
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
import PhoneNumberBox from "../../custom/PhoneNumberBox";
import { isValidPhoneNumber } from "libphonenumber-js";
import PinCodeBox from "../../custom/PinCodeBox";

const CreatePatientForm = ({ open, handleClose, refresh }) => {
  const [doctorsList, setDoctorsList] = useState([]);
  const [doctorAvailability, setDoctorsAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState(null);
  const [appointmentSlots, setAppointmentSlots] = useState([]);
  const [selectedAppointmentTime, setSelectedAppointmentTime] = useState("");
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  const [areas, setAreas] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: null,
    mobile_number: "",
    gender: "",
    email: "",
    country: "",
    state: "",
    city: "",
    zip_code: "",
    area: "",
    street: "",
    land_mark: "",
    house_number: "",
    doctor: "",
  });

  useEffect(() => {
    fetchDoctors();

    return () => {
      clearFormData();
    };
  }, []);

  useEffect(() => {
    if (formData.doctor && formData.doctor !== "") {
      getDoctorAvailability(formData.doctor);
    }
  }, [formData.doctor]);

  const clearFormData = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dob: null,
      mobile_number: "",
      gender: "",
      email: "",
      country: "",
      state: "",
      city: "",
      zip_code: "",
      area: "",
      street: "",
      land_mark: "",
      house_number: "",
      doctor: "",
    });
    setSelectedAppointmentDate(null);
    setSelectedAppointmentTime("");
    setFormErrors({});
  };

  const disableDob = (date) => {
    return date > new Date();
  };

  const handleAppointment = (event) => {
    const { value } = event.target;
    setSelectedAppointmentDate(value);
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

  const getAreasByPinCode = async (zipcode) => {
    try {
      const response = await axios.get(
        `${basePath}/patient/check-pincode/${zipcode}`
      );
      setAreas([...response.data?.areas]);
    } catch (error) {
      console.error("error in fetching areas by pincode ", error);
    }
  };

  const validateCreatePatient = () => {
    const errors = {};
    const requiredFields = [
      "firstName",
      "lastName",
      "mobile_number",
      "gender",
      "doctor",
    ];
    requiredFields.forEach((field) => {
      if (formData[field] == "") {
        errors[field] = "This field is required";
      }
    });

    if (formData.dob === null) {
      errors.dob = "This field was required";
    }

    if (formData.mobile_number !== "") {
      const isValid = isValidPhoneNumber(formData.mobile_number);
      if (!isValid) {
        errors.mobile_number = "Invalid phone number";
      }
    }

    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(formData.email)) {
      errors.email = "Invalid email address";
    }
    return errors;
  };

  const validateAppointment = () => {
    if (formData.doctor !== "") {
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

    const errors = validateCreatePatient();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const appointmentError = validateAppointment();
    if (appointmentError) return;

    const patientPayload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      dob: formData?.dob?.format("YYYY-MM-DD") ?? "",
      mobile_number: formData.mobile_number,
      age: formData.age,
      gender: formData.gender,
      email: formData.email,
      address: {
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pin_code: formData.zip_code?.value,
        area: formData.area,
        street: formData.street,
        landmark: formData.land_mark,
        house_number: formData.house_number,
      },
    };

    try {
      setIsLoading(true);
      const response = await axios.post(`${basePath}/patient/`, patientPayload);
      console.log(response.data);

      if (formData.doctor !== "") {
        const slot = selectedAppointmentTime.split("-");
        const appointmetPayload = {
          doctor: formData.doctor,
          patient: response.data.id,
          date: selectedAppointmentDate.format("YYYY-MM-DD"),
          start_time: slot[0],
          end_time: slot[1],
        };
        const appointmentResponse = await axios.post(
          `${basePath}/patient/appointment/`,
          appointmetPayload
        );
        toast.success("Appointment created successfully");
      }
      toast.success("patient created successfully");
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
    let { name, value } = event.target;

    // remove error if present
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }

    if (name === "firstName" || name === "lastName") {
      value = value.replace(/[^a-zA-Z ]/g, "");
    }

    setFormData({ ...formData, [name]: value });
    if (name === "doctor") {
      setSelectedAppointmentDate(null);
    }
  };

  const handlePhoneNumberChange = (newValue) => {
    if (formErrors.mobile_number) {
      setFormErrors({ ...formErrors, mobile_number: "" });
    }
    setFormData({ ...formData, mobile_number: newValue });
  };

  const handlePinCodeChange = (zipCode) => {
    setFormData({ ...formData, zip_code: zipCode, area: "" });
    getAreasByPinCode(zipCode?.value);
  };

  const handleAreaChange = (event) => {
    let { name, value } = event.target;
    setFormData({ ...formData, area: value });
  };

  const handleDateChange = (name, date) => {
    if (formErrors.dob) {
      setFormErrors({ ...formErrors, dob: "" });
    }

    if (name === "dob") {
      setFormData({ ...formData, dob: date });
      return;
    }
    setSelectedAppointmentDate(date);
    const formattedDate = date.format("YYYY-MM-DD");
    const selectedDate = doctorAvailability.filter(
      (dateObj) => dateObj.date == formattedDate
    );
    setAppointmentSlots(selectedDate[0].slots);
  };

  const handleSlotChange = (index, time) => {
    setSelectedAppointmentTime(time);
    setSelectedSlotIndex(index);
  };

  const isAllowedDate = (day) =>
    doctorAvailability.some((allowedDate) =>
      day.isSame(allowedDate.date, "day")
    );

  const renderDay = (day, _selectedDate, _isInCurrentMonth, dayComponent) => {
    const highlightColor = isAllowedDate(day) ? "lightgreen" : "inherit";
    return React.cloneElement(dayComponent, {
      style: { backgroundColor: highlightColor },
    });
  };

  const getAgeFromDOB = () => {
    if (formData.dob) {
      const date = formData?.dob?.format("YYYY-MM-DD");
      const dobDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();

      const hasBirthdayPassed =
        today.getMonth() > dobDate.getMonth() ||
        (today.getMonth() === dobDate.getMonth() &&
          today.getDate() >= dobDate.getDate());

      if (!hasBirthdayPassed) {
        age--;
      }
      return age;
    }
    return "";
  };

  console.log("form data", formData);

  return (
    <div>
      {isLoading && <Spinner />}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="flex justify-between">
          <span>Create New Patient</span>
          <IoClose size={24} onClick={handleClose} className="cursor-pointer" />
        </DialogTitle>
        <DialogContent className="mt-3">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div>
                    <DatePicker
                      label="Select DOB"
                      value={formData.dob}
                      onChange={(date) => handleDateChange("dob", date)}
                      textField={(props) => <input {...props} />}
                      shouldDisableDate={disableDob}
                    />
                    {formErrors.dob && (
                      <p className="text-red-600 text-[14px] ml-4">
                        {formErrors.dob}
                      </p>
                    )}
                  </div>
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Age"
                  fullWidth
                  name="age"
                  value={getAgeFromDOB()}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <PhoneNumberBox
                  value={formData.mobile_number}
                  handlePhoneNumberChange={handlePhoneNumberChange}
                  errorMsg={formErrors.mobile_number}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  fullWidth
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Gender"
                  fullWidth
                  select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  helperText={formErrors.gender}
                  error={!!formErrors.gender}
                  required
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Others</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Country"
                  fullWidth
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="State"
                  fullWidth
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="City"
                  fullWidth
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <PinCodeBox
                  value={formData?.zip_code}
                  handlePinCodeChange={(value) => handlePinCodeChange(value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  label="Area"
                  fullWidth
                  name="area"
                  value={formData.area}
                  onChange={handleAreaChange}
                  disabled={!formData.zip_code}
                >
                  {areas.map((area, index) => (
                    <MenuItem key={`${index}-${area}`} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Street"
                  fullWidth
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Land Mark"
                  fullWidth
                  name="land_mark"
                  value={formData.land_mark}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Door No"
                  fullWidth
                  name="house_number"
                  value={formData.road_number}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Doctors"
                  fullWidth
                  select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  required
                  error={!!formErrors.doctor}
                  helperText={formErrors.doctor}
                >
                  {doctorsList.map((doctor) => {
                    return (
                      <MenuItem value={doctor.id} key={doctor.id}>
                        {doctor.user.username} {doctor.user.last_name}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              {formData.doctor !== "" && (
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
                <Grid item xs={12}>
                  <Grid container spacing={2} className="mt-3">
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
            <DialogActions className="flex justify-end mt-3">
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Create
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePatientForm;
