import React, { useState, useEffect } from "react";
import axios from "axios";
import apiConfig from "../apiConfig";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { basePath } from "../constants/ApiPaths";
import Spinner from "../custom/Spinner";
import { toast } from "react-toastify";
import { getAccessToken } from "../common/businesslogic";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/doctor/department`);
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (newDepartment.trim() === "") {
      alert("Please enter a department name.");
      return;
    }
    const accessToken = getAccessToken();
    try {
      setIsLoading(true);
      await axios.post(
        `${basePath}/doctor/department/`,
        { name: newDepartment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setNewDepartment("");
      fetchDepartments();
      toast.success("Department added successfully");
    } catch (error) {
      console.error("Error adding department:", error);
      if (error.response.status == 400) {
        toast.error(error.response.data.name[0]);
      }
      if (error.response.status == 500) {
        toast.error("something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalDate = (dateString) => {
    const dateObject = new Date(dateString);
    const localDate = dateObject.toLocaleDateString();
    return localDate;
  };

  return (
    <div className="flex flex-col gap-3 p-5 bg-[#ffffff]">
      {isLoading && <Spinner />}
      <span className="font-bold text-lg">Departments</span>
      <div className="flex justify-end items-center gap-5">
        <input
          type="text "
          className="border h-10 rounded-md w-80 px-3"
          placeholder="Enter Department Name "
          value={newDepartment}
          onChange={(e) => setNewDepartment(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddDepartment}
        >
          Add Department
        </Button>
      </div>
      <div className="mt-5">
        {departments.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Department Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Created Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department?.created_by?.username}</TableCell>
                    <TableCell>
                      {department?.created_at
                        ? getLocalDate(department.created_at)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p>No departments added yet.</p>
        )}
      </div>
    </div>
  );
};

export default DepartmentList;
