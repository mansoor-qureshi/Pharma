import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Grid, TextField } from "@mui/material";
import { CiSearch } from "react-icons/ci";
import Spinner from "../../custom/Spinner";
import { basePath } from "../../constants/ApiPaths";
import CreateUserForm from "./CreateUserForm";
import UserList from "./UserList";
import { SearchInput } from "../../common/searchInput";
import { useSearch } from "../../context/SearchContext";
const baseStyle = "border border-2 rounded-full cursor-pointer p-1 px-3";

const UserControl = () => {
  const [userList, setUserList] = useState([]);
  const [open, setOpen] = useState(false); // State to control dialog visibility
  const [snackOpen, setSnackOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDoctors, setIsDoctors] = useState(true);
  const { searchTerm } = useSearch();

  useEffect(() => {
    if (isDoctors) {
      getDoctorsData();
    } else {
      getAdminstrationData();
    }
  }, [isDoctors]);

  const getDoctorsData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/doctor/create`);
      setUserList(response.data);
    } catch (error) {
      console.error("error in fetching doctors in usercontrol", error);
    } finally {
      setIsLoading(false);
    }
  };
  const filteredUserList = userList.filter((eachUser) => {
    if (!searchTerm) return true;
    const userName = eachUser?.user?.username
      ? eachUser?.user?.username.toString().trim().toLowerCase()
      : "";
    const mobileNumber = eachUser?.user?.mobile_number
      ? eachUser?.user?.mobile_number.toString().trim().toLowerCase()
      : "";
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();
    return (
      userName.includes(trimmedSearchTerm) ||
      mobileNumber.includes(trimmedSearchTerm)
    );
  });
  const getAdminstrationData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/core/users`);
      setUserList(response.data);
    } catch (error) {
      console.error("error in fetching adminstration in usercontrol", error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log("use list", userList);
  const handleCreateUserClick = (e) => {
    e.preventDefault();
    setOpen(true); // Open the dialog when "Create New User" button is clicked
  };

  const handleClose = () => {
    setOpen(false); // Close the dialog
  };

  const refresh = () => {
    getDoctorsData();
    setIsDoctors(true);
  };

  const handleList = (value) => {
    if (value === "doctors") {
      setIsDoctors(true);
    } else {
      setIsDoctors(false);
    }
  };

  return (
    <div className="w-full h-full p-3 border bg-[#ffffff] ">
      {/* {isLoading && <Spinner />} */}
      <div className="p-3 flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <div className="relative">
            <SearchInput />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateUserClick}
          >
            Create New User
          </Button>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex gap-3">
            <div
              className={`${baseStyle} ${isDoctors ? "bg-blue-200" : ""}`}
              onClick={() => handleList("doctors")}
            >
              Doctors
            </div>
            <div
              className={`${baseStyle} ${!isDoctors ? "bg-blue-200" : ""}`}
              onClick={() => handleList("adminstration")}
            >
              Adminstration
            </div>
          </div>
          {filteredUserList.length === 0 ? (
            <div className="font-bold text-[18px] flex justify-center mt-5">
              No Doctors found matching the search!
            </div>
          ) : (
            <UserList
              userList={filteredUserList}
              isDoctorsList={isDoctors}
              isLoading={isLoading}
              searchTerm={searchTerm}
            />
          )}
        </div>
        {open && (
          <CreateUserForm
            open={open}
            handleClose={handleClose}
            refresh={refresh}
          />
        )}
      </div>
    </div>
  );
};

export default UserControl;
