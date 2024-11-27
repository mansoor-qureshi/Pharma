import {
  Button,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNewCategoryName } from "../redux/catagorySlice";
import { getAccessToken } from "../common/businesslogic";
import axios from "axios";
import { toast } from "react-toastify";
import { basePath } from "../constants/ApiPaths";

const medicineListHeaders = [
  {
    label: "Category Id",
    id: "id",
  },
  {
    label: "Category Name",
    id: "categoryname",
  },
  {
    label: "Created Date",
    id: "date",
  },
  {
    label: "Created By",
    id: "createdby",
  },
];
const MedicineCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryList, setCategoryList] = useState([])
  const newCategoryName = useSelector((store) => store.newCategoryName);

  const dispatch = useDispatch();
  const maxLength = 40;

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      dispatch(setNewCategoryName(value));
    } else {
      toast.warn(`Maximum length is ${maxLength} characters`);
    }
  };
  useEffect(() => {
    fetchCategoryList();
  }, []);

  const fetchCategoryList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/inventory/category`);
      setCategoryList(response.data);
    } catch (error) {
      console.error("Error fetching categoryList:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddCategory = async () => {
    if (newCategoryName.trim() === "") {
      alert("Please enter Medicine name.");
      return;
    }

    const accessToken = getAccessToken();
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${basePath}/inventory/category/`,
        { name: newCategoryName },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      dispatch(setNewCategoryName(""));
      fetchCategoryList();
      toast.success("Medicine Category added successfully");
      console.log("medicine data was showing : " + response.data);
    } catch (error) {
      console.error("Error adding Medicine:", error);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.name[0]);
      } else if (error.response && error.response.status === 500) {
        toast.error("Something went wrong");
      }
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
  const getLocalDate = (dateString) => {
    const newData = new Date(dateString);
    return newData.toLocaleDateString();
  };
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCampaigns = categoryList?.slice(startIndex, endIndex);
  return (
    <div className="w-full h-full p-3 border bg-[#ffffff]">
      <div className="p-3 flex flex-col gap-10">
        <span className="font-bold text-lg">Medicine Category</span>
        <div className="flex justify-end items-center gap-5">
          <input
            type="text"
            className="border h-10 rounded-md w-80 px-3"
            placeholder="Enter Medicine Name"
            value={newCategoryName}
            onChange={handleInputChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCategory}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Category"}
          </Button>
        </div>
        <div className="mt-5">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {medicineListHeaders.map((data) => (
                    <TableCell sx={{ fontWeight: "bold" }} key={data.id}>
                      {data.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCampaigns.map((eachNedicineCategory) => (
                  <TableRow key={eachNedicineCategory.id}>
                    <TableCell>{eachNedicineCategory.id}</TableCell>
                    <TableCell>{eachNedicineCategory.name}</TableCell>

                    <TableCell>
                      {getLocalDate(eachNedicineCategory.created_at)}
                    </TableCell>
                    <TableCell>
                      {eachNedicineCategory?.created_by?.username}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(categoryList?.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            style={{ marginTop: 20 }}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicineCategory;
