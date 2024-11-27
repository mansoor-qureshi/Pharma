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
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { doctorAvailability } from "../../constants/DoctorConstant";
import DoctorAvailability from "../DoctorAvailability";
import { toast } from "react-toastify";
import Spinner from "../../custom/Spinner";
import { basePath } from "../../constants/ApiPaths";
import Signature from "../doctor_components/Signature";
import { IoMdClose } from "react-icons/io";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PhoneNumberBox from "../../custom/PhoneNumberBox";
import { isValidPhoneNumber } from "libphonenumber-js";
import usePincodes from "../../hooks/usePincodes";
import PinCodeBox from "../../custom/PinCodeBox";
import { roles } from "../../utils/Roles";

const CreateUserForm = ({ open, handleClose, refresh, doctorInfo = null }) => {
  const [formData, setFormData] = useState({
    role: "",
    first_name: "",
    last_name: "",
    username: "",
    dob: null,
    email: "",
    phone_number: "",
    password: "",
    department: "",
    qualification: "",
    experience: "",
    op_fee: "",
    country: "",
    state: "",
    city: "",
    zip_code: "",
    area: "",
    street: "",
    land_mark: "",
    house_number: "",
    license: "",
    availability: { ...doctorAvailability },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [filterDepartments, setFilterDepartments] = useState([]);
  const [filterQualification, setFilterQualification] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
  const [signatureImage, setSignatureImage] = useState("");
  const [areas, setAreas] = useState([]);

  const phone_number = doctorInfo?.user?.mobile_number;
  const email = doctorInfo?.user?.email;

  useEffect(() => {
    fetchDepartments();
    fetchQualification();
    if (doctorInfo) {
      handleDoctorData();
    }
    return () => {
      clearFormData();
    };
  }, []);

  const clearFormData = () => {
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      dob: null,
      email: "",
      phone_number: "",
      password: "",
      department: "",
      role: "",
      qualification: "",
      experience: "",
      op_fee: "",
      country: "",
      state: "",
      city: "",
      zip_code: "",
      area: "",
      street: "",
      land_mark: "",
      house_number: "",
      license: "",
      availability: { ...doctorAvailability },
    });
    setSignatureImage("");
    setFormErrors({});
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

  const handleDoctorData = async () => {
    const availableDays = { ...doctorAvailability };
    doctorInfo?.availability?.forEach((availability) => {
      const splitStartTime = availability.start_time.split(":");
      const splitEndTime = availability.end_time.split(":");
      const start_time = `${splitStartTime[0]}:${splitStartTime[1]}`;
      const end_time = `${splitEndTime[0]}:${splitEndTime[1]}`;
      availableDays[availability.day.day_of_week] = {
        checked: true,
        startTime: start_time,
        endTime: end_time,
      };
    });
    const data = {
      first_name: doctorInfo?.user?.first_name ?? "",
      last_name: doctorInfo?.user?.last_name ?? "",
      username: doctorInfo?.user?.username ?? "",
      email: doctorInfo?.user?.email ?? "",
      phone_number: doctorInfo?.user?.mobile_number ?? "",
      dob: doctorInfo?.user?.dob ? dayjs(doctorInfo?.user?.dob) : "",
      password: "",
      department: doctorInfo?.department?.id ?? "",
      role: doctorInfo.role ?? "",
      qualification: doctorInfo?.specialization?.id ?? "",
      experience: doctorInfo?.experience ?? "",
      op_fee: doctorInfo?.op_fee?.split(".")[0] ?? "",
      country: doctorInfo?.address?.country ?? "",
      state: doctorInfo?.address?.state ?? "",
      city: doctorInfo?.address?.city ?? "",
      zip_code: doctorInfo?.address?.pin_code
        ? {
            label: doctorInfo?.address?.pin_code,
            value: doctorInfo?.address?.pin_code,
          }
        : "",
      area: doctorInfo?.address?.area ?? "",
      street: doctorInfo?.address?.street ?? "",
      land_mark: doctorInfo?.address?.landmark ?? "",
      license: doctorInfo?.license ?? "",
      house_number: doctorInfo?.address?.house_no ?? "",
      availability: { ...availableDays },
    };
    setFormData(data);
    if (doctorInfo?.address?.pin_code) {
      await getAreasByPinCode(doctorInfo?.address?.pin_code);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${basePath}/doctor/department`);
      setFilterDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };
  const fetchQualification = async () => {
    try {
      const response = await axios.get(`${basePath}/doctor/specialization`);
      setFilterQualification(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const prepareData = () => {
    const finalData = {
      user: {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        mobile_number: formData.phone_number,
        email: formData.email,
        dob: formData?.dob?.format("YYYY-MM-DD") ?? "",
        group: formData.role,
      },
      specialization: formData.qualification,
      department: formData.department,
      experience: formData.experience,
      license: formData.license,
      op_fee: formData.op_fee,
      address: {
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pin_code: formData.zip_code?.value,
        area: formData.area,
        street: formData.street,
        landmark: formData.land_mark,
        house_no: formData.house_number,
      },
      daytimeavailability: [],
      signatureImage: signatureImage,
    };

    Object.keys(formData.availability).forEach((day) => {
      const dayAvailability = formData.availability[day];
      if (dayAvailability.checked) {
        const availableData = {
          day: {
            day_of_week: day,
          },
          start_time: dayAvailability.startTime,
          end_time: dayAvailability.endTime,
        };
        finalData.daytimeavailability.push(availableData);
      }
    });

    return finalData;
  };

  const validateFormForUpdate = () => {
    const errors = {};

    let requiredFields = [
      "role",
      "first_name",
      "last_name",
      "username",
      "phone_number",
    ];
    if (formData.role === "doctor") {
      requiredFields = [
        ...requiredFields,
        "department",
        "qualification",
        "experience",
        "op_fee",
        "license",
      ];
    }

    console.log("required", requiredFields, formData);
    requiredFields.forEach((field) => {
      if (formData[field] === "") {
        errors[field] = "This field is required";
      }
    });

    if (formData.dob === null) {
      errors.dob = "This field is required";
    }

    if (formData.phone_number !== "") {
      const isValid = isValidPhoneNumber(formData.phone_number);
      if (!isValid) {
        errors.phone_number = "Invalid phone number";
      }
    }
    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    return errors;
  };

  const validateCreateUserForm = () => {
    const errors = {};

    let requiredFields = [
      "role",
      "first_name",
      "last_name",
      "username",
      "phone_number",
      "password",
    ];
    if (formData.role === "doctor") {
      requiredFields = [
        ...requiredFields,
        "department",
        "qualification",
        "experience",
        "op_fee",
        "license",
      ];
    }
    console.log("required", requiredFields, formData);
    requiredFields.forEach((field) => {
      if (formData[field] === "") {
        errors[field] = "This field is required";
      }
    });

    if (formData.dob === null) {
      errors.dob = "This field is required";
    }

    if (formData.phone_number !== "") {
      const isValid = isValidPhoneNumber(formData.phone_number);
      if (!isValid) {
        errors.phone_number = "Invalid phone number";
      }
    }

    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    if (!doctorInfo && formData.role === "doctor" && signatureImage === "") {
      errors.signature = "signature is required";
    }

    if (
      !doctorInfo &&
      formData.password !== "" &&
      formData.password.length < 6
    ) {
      errors.password = "password length should min of 6 characters";
    }

    return errors;
  };

  const validateAvailability = () => {
    let errorOccured = false;
    Object.keys(formData.availability).forEach((day) => {
      const dayAvailability = formData.availability[day];
      if (dayAvailability.checked) {
        if (dayAvailability.startTime == "" || dayAvailability.endTime === "") {
          errorOccured = true;
          toast.error(`please select start and end time on ${day}`);
          return;
        }
        const start = dayAvailability.startTime.split(":");
        const end = dayAvailability.endTime.split(":");

        if (+start[0] > +end[0]) {
          errorOccured = true;
          toast.error("start time less than end time");
        }
        if (+start[0] == +end[0]) {
          if (+start[1] > +end[1]) {
            errorOccured = true;
            toast.error("start time less than end time minutes");
          }
        }
      }
    });
    return errorOccured;
  };

  const createDoctor = async () => {
    const finalData = prepareData();
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${basePath}/doctor/create/`,
        finalData
      );
      toast.success("user created successfully");
      refresh();
      handleClose();
    } catch (error) {
      if (error.response.status === 400) {
        const errorObject = error.response.data;
        let errorOccured = false;

        Object.keys(errorObject).forEach((key) => {
          if (!errorOccured) {
            if (key === "user") {
              Object.keys(errorObject.user).forEach((userKey) => {
                if (!errorOccured) {
                  toast.error(errorObject.user[userKey][0]);
                  errorOccured = true;
                  return;
                }
              });
            } else {
              toast.error(errorObject[key][0]);
              errorOccured = true;
              return;
            }
          }
        });
      }
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminstration = async () => {
    const finalData = {
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      password: formData.password,
      mobile_number: formData.phone_number,
      email: formData.email,
      dob: formData?.dob?.format("YYYY-MM-DD") ?? "",
      group: formData.role,
      address: {
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pin_code: formData.zip_code?.value ?? "",
        area: formData.area,
        street: formData.street,
        landmark: formData.land_mark,
        house_no: formData.house_number,
      },
    };
    console.log("final", finalData);
    try {
      setIsLoading(true);
      const response = await axios.post(`${basePath}/core/users/`, finalData);
      toast.success("user created successfully");
      refresh();
      handleClose();
    } catch (error) {
      if (error.response.status === 400) {
        const errorObject = error.response.data;
        let errorOccured = false;

        Object.keys(errorObject).forEach((key) => {
          if (!errorOccured) {
            if (key === "user") {
              Object.keys(errorObject.user).forEach((userKey) => {
                if (!errorOccured) {
                  toast.error(errorObject.user[userKey][0]);
                  errorOccured = true;
                  return;
                }
              });
            } else {
              toast.error(errorObject[key][0]);
              errorOccured = true;
              return;
            }
          }
        });
      }
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateCreateUserForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let errorOccured = validateAvailability();
    if (errorOccured) return;

    if (formData.role === "doctor") {
      await createDoctor();
    } else {
      await createAdminstration();
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    const errors = validateFormForUpdate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let errorOccured = validateAvailability();
    if (errorOccured) return;

    const finalData = {
      user: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        dob: formData?.dob.format("YYYY-MM-DD") ?? "",
      },
      specialization: formData.qualification,
      department: formData.department,
      experience: formData.experience,
      op_fee: formData.op_fee,
      address: {
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pin_code: formData.zip_code?.value,
        area: formData.area?.value,
        street: formData.street,
        landmark: formData.land_mark,
        house_no: formData.house_number,
      },
      daytimeavailability: [],
    };

    if (phone_number != formData?.phone_number) {
      finalData.user.mobile_number = formData.phone_number;
    }
    if (email != formData?.email) {
      finalData.user.email = formData.email;
    }

    Object.keys(formData.availability).forEach((day) => {
      const dayAvailability = formData.availability[day];
      if (dayAvailability.checked) {
        const availableData = {
          day: {
            day_of_week: day,
          },
          start_time: dayAvailability.startTime,
          end_time: dayAvailability.endTime,
        };
        finalData.daytimeavailability.push(availableData);
      }
    });

    try {
      setIsLoading(true);
      const response = await axios.patch(
        `${basePath}/doctor/update/${doctorInfo.id}`,
        finalData
      );
      toast.success("User Info updated successfully");
      refresh();
      handleClose();
    } catch (error) {
      if (error.response.status === 400) {
        const errorObject = error.response.data;
        let errorOccured = false;

        Object.keys(errorObject).forEach((key) => {
          if (!errorOccured) {
            if (key === "user") {
              Object.keys(errorObject.user).forEach((userKey) => {
                if (!errorOccured) {
                  toast.error(errorObject.user[userKey][0]);
                  errorOccured = true;
                  return;
                }
              });
            } else {
              toast.error(errorObject[key][0]);
              errorOccured = true;
              return;
            }
          }
        });
      }
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    let { name, value } = event.target;

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }

    if (name === "first_name" || name === "last_name") {
      value = value.replace(/[^a-zA-Z ]/g, "");
    }

    if (name === "username") {
      value = value.replace(/[^a-zA-Z0-9 ]/g, "");
    }

    if (name === "experience" || name === "op_fee") {
      value = value.replace(/\D/g, "");
    }

    if (
      name === "city" ||
      name === "street" ||
      name == "country" ||
      name == "state"
    ) {
      value = value.replace(/[0-9]/g, "");
    }

    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneNumberChange = (newValue) => {
    if (formErrors.phone_number) {
      setFormErrors({ ...formErrors, phone_number: "" });
    }
    setFormData({ ...formData, phone_number: newValue });
  };

  const handlePinCodeChange = (zipCode) => {
    setFormData({ ...formData, zip_code: zipCode, area: "" });
    getAreasByPinCode(zipCode?.value);
  };

  const handleAreaChange = (event) => {
    let { name, value } = event.target;
    setFormData({ ...formData, area: value });
  };

  const onAvailabilityChange = (data) => {
    setFormData((prevState) => ({
      ...prevState,
      availability: { ...data },
    }));
  };

  const handleSignature = (e) => {
    e.preventDefault();
    setOpenSignatureDialog(true);
  };

  const removeSignatureImage = (e) => {
    e.preventDefault();
    setSignatureImage("");
  };

  const disableDob = (date) => {
    return date > new Date();
  };

  const handleDateChange = (name, date) => {
    if (formErrors.dob) {
      setFormErrors({ ...formErrors, dob: "" });
    }
    setFormData({ ...formData, dob: date });
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

  return (
    <div>
      {isLoading && <Spinner />}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <div className="flex justify-between items-center">
            <span>
              {!doctorInfo ? "Create New User" : "Update Doctor Details"}
            </span>
            <IoMdClose onClick={handleClose} className="cursor-pointer" />
          </div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Role"
                  fullWidth
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  error={!!formErrors.role}
                  helperText={formErrors.role}
                  disabled={doctorInfo}
                  required
                >
                  {roles.map((role) => {
                    return (
                      <MenuItem value={role.value} key={role.id}>
                        {role.label}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              {formData.role === "doctor" && (
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Department"
                    fullWidth
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    error={!!formErrors.department}
                    helperText={formErrors.department}
                    disabled={doctorInfo}
                    required
                  >
                    {filterDepartments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              {formData.role === "doctor" && (
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Qualification"
                    fullWidth
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    error={!!formErrors.qualification}
                    helperText={formErrors.qualification}
                    required
                  >
                    {filterQualification.map((qualification) => (
                      <MenuItem key={qualification.id} value={qualification.id}>
                        {qualification.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={!!formErrors.first_name}
                  helperText={formErrors.first_name}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={!!formErrors.last_name}
                  helperText={formErrors.last_name}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Username"
                  fullWidth
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                  disabled={doctorInfo}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className="border-red-500">
                    <DatePicker
                      label="Select DOB"
                      value={formData.dob}
                      onChange={(date) => handleDateChange("dob", date)}
                      textField={(props) => <input {...props} />}
                      shouldDisableDate={disableDob}
                      disabled={doctorInfo}
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
                <TextField
                  label="Email"
                  fullWidth
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <PhoneNumberBox
                  value={formData.phone_number}
                  handlePhoneNumberChange={handlePhoneNumberChange}
                  errorMsg={formErrors.phone_number}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Country"
                  fullWidth
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={doctorInfo}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="State"
                  fullWidth
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={doctorInfo}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="City"
                  fullWidth
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={doctorInfo}
                />
              </Grid>

              <Grid item xs={6}>
                <PinCodeBox
                  value={formData?.zip_code}
                  handlePinCodeChange={(value) => handlePinCodeChange(value)}
                  disabled={doctorInfo}
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
                  disabled={!formData.zip_code || doctorInfo}
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
                  disabled={doctorInfo}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Land Mark"
                  fullWidth
                  name="land_mark"
                  value={formData.land_mark}
                  onChange={handleChange}
                  disabled={doctorInfo}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Door No"
                  fullWidth
                  name="house_number"
                  value={formData.house_number}
                  onChange={handleChange}
                  disabled={doctorInfo}
                />
              </Grid>

              {!doctorInfo && (
                <Grid item xs={6}>
                  <TextField
                    label="Password"
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <VisibilityIcon />
                          ) : (
                            <VisibilityOffIcon />
                          )}
                        </IconButton>
                      ),
                    }}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    required
                  />
                </Grid>
              )}

              {formData.role === "doctor" && (
                <>
                  <Grid item xs={6}>
                    <TextField
                      label="Experience"
                      fullWidth
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      error={!!formErrors.experience}
                      helperText={formErrors.experience}
                      required={formData.role === "doctor"}
                      disabled={doctorInfo}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label="OP Fee"
                      fullWidth
                      name="op_fee"
                      value={formData.op_fee}
                      onChange={handleChange}
                      error={!!formErrors.op_fee}
                      helperText={formErrors.op_fee}
                      required={formData.role === "doctor"}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label="License"
                      fullWidth
                      name="license"
                      value={formData.license}
                      onChange={handleChange}
                      error={!!formErrors.license}
                      helperText={formErrors.license}
                      required={formData.role === "doctor"}
                      disabled={doctorInfo}
                    />
                  </Grid>

                  {!doctorInfo && (
                    <Grid item xs={6}>
                      <button
                        className={`p-2 ${
                          signatureImage ? "bg-red-300" : "bg-blue-300"
                        } rounded-md cursor-pointer`}
                        onClick={
                          signatureImage
                            ? removeSignatureImage
                            : handleSignature
                        }
                      >
                        {signatureImage ? "Remove Signature" : "Add Signature"}
                      </button>
                      {!signatureImage && formErrors.signature && (
                        <p className="text-red-600">{formErrors.signature}</p>
                      )}
                    </Grid>
                  )}
                  {signatureImage && (
                    <Grid item xs={6}>
                      <img
                        src={signatureImage}
                        alt="Signature"
                        className="border border-black w-25 h-25"
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <hr className="mt-2" />

                    <DialogTitle>Availabilty</DialogTitle>
                    <DoctorAvailability
                      doctorAvailability={formData.availability}
                      onAvailabilityChange={(data) =>
                        onAvailabilityChange(data)
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>
            <DialogActions style={{ justifyContent: "flex-end" }}>
              <div className="flex justify-center items-center gap-3   mt-5">
                <Button onClick={handleClose} color="secondary">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={!doctorInfo ? handleSubmit : handleUpdate}
                >
                  {!doctorInfo ? "Create" : "Update"}
                </Button>
              </div>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      {openSignatureDialog && (
        <Signature
          openSignatureDialog={openSignatureDialog}
          setOpenSignatureDialog={setOpenSignatureDialog}
          setSignatureImage={setSignatureImage}
        />
      )}
    </div>
  );
};

export default CreateUserForm;
