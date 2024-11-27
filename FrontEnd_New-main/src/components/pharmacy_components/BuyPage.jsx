import React, { useEffect, useState } from "react";
import { SearchInput, highlightText } from "../../common/searchInput";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Spinner from "../../custom/Spinner";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import axios from "axios";
import { basePath } from "../../constants/ApiPaths";
import { getAccessToken } from "../../common/businesslogic";
import { useDispatch, useSelector } from "react-redux";
import {
  setMedicineCounts,
  setMedicineStock,
  incrementCount,
  decrementCount,
  setCountByInput,
  setBasketData,
  resetMedicineState,
} from "../../redux/catagorySlice";
import { useSearch } from "../../context/SearchContext";
import { CiSearch } from "react-icons/ci";

const BuyPage = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(""); // Controlled input for search
  const [isLoading, setIsLoading] = useState(false);
  const [searchMedicineData, setSearchMedicineData] = useState([]);
  const { medicineCategoryDetails, appointment_id } = location.state || {};
  if (!medicineCategoryDetails) {
    return <div>No data available.</div>;
  }

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { medicineCount, medicineStock } = useSelector((state) => state);

  const handleBack = () => {
    navigate(-1);
    dispatch(resetMedicineState());
  };
  useEffect(() => {
    const initialStock = medicineCategoryDetails.reduce((acc, medicine) => {
      acc[medicine.id] = medicine.stock?.quantity || 0;
      return acc;
    }, {});
    dispatch(setMedicineStock(initialStock));
  }, [medicineCategoryDetails]);
  const handleIncrement = (medicineId) => {
    const currentCount = medicineCount[medicineId] || 0;
    const currentStock = medicineStock[medicineId] || 0;

    if (currentStock > 0) {
      dispatch(incrementCount({ medicineId })); // Increment count
      dispatch(
        setMedicineStock({
          ...medicineStock,
          [medicineId]: currentStock - 1, // Decrease stock
        })
      );
    } else {
      alert("No stock available for this medicine.");
    }
  };

  const handleDecrement = (medicineId) => {
    const currentCount = medicineCount[medicineId] || 0;
    const currentStock = medicineStock[medicineId] || 0;

    if (currentCount > 0) {
      dispatch(decrementCount({ medicineId })); // Decrement count
      dispatch(
        setMedicineStock({
          ...medicineStock,
          [medicineId]: currentStock + 1, // Increase stock
        })
      );
    }
  };

  const handleCountChange = (medicineId, event) => {
    const value = event.target.value;
    const stockQuantity = medicineStock[medicineId] || 0;
    const currentCount = medicineCount[medicineId] || 0;

    if (value === "") {
      dispatch(
        setCountByInput({
          medicineId,
          count: 0,
          stockQuantity: stockQuantity + currentCount, // Reset stock
        })
      );
    } else {
      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        const newStock = stockQuantity + currentCount - parsedValue;

        if (newStock >= 0) {
          dispatch(
            setCountByInput({
              medicineId,
              count: parsedValue,
              stockQuantity: newStock,
            })
          );
        } else {
          alert("Requested quantity exceeds available stock.");
        }
      }
    }
  };

  const handleAddAllToBasket = async () => {
    const selectedMedicines = Object.keys(medicineCount)
      .filter((id) => medicineCount[id] && medicineCount[id] > 0)
      .map((medicineId) => {
        const medicine = medicineCategoryDetails.find(
          (med) => med.id === Number(medicineId)
        );
        if (medicine) {
          return {
            id: medicine.id,
            quantity_requested: medicineCount[medicineId],
          };
        }
        return null;
      })
      .filter((item) => item !== null);

    if (selectedMedicines.length === 0) {
      alert("No medicines selected to add to basket.");
      return;
    }

    const accessToken = getAccessToken();
    const dataToSend = {
      appointment_id,
      prescription_items: selectedMedicines,
    };

    try {
      setIsLoading(true);
      const response = await axios.post(
        ` ${basePath}/inventory/process_prescription/`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response?.data) {
        dispatch(setBasketData(response.data));
      }
      navigate(`/basket-page`);
    } catch (error) {
      console.error(
        "Error adding medicines:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchData();
  }, [searchTerm]);
  const fetchSearchData = async () => {
    try {
      const response = await axios.get(
        ` ${basePath}/inventory/medicines/?search=${searchTerm.trim()}`
      );
      if (response.data?.results) {
        setSearchMedicineData(response.data?.results);
      }
    } catch (error) {
      console.error("Error while fetching search data:", error.message);
    }
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const filteredPatients = searchMedicineData.filter((eachMedicine) => {
    if (!searchTerm) return true; // Return all if no search term is entered

    const MedicineName = eachMedicine.name
      ? eachMedicine.name.toString().trim().toLowerCase()
      : "";

    const trimmedSearchTerm = searchTerm
      .trim()
      .replace(/\s+/g, "") // Normalize search term by removing spaces
      .toLowerCase();

    // Remove spaces from the MedicineName and compare it with the trimmedSearchTerm
    const normalizedMedicineName = MedicineName.replace(
      /\s+/g,
      ""
    ).toLowerCase();

    return normalizedMedicineName.includes(trimmedSearchTerm);
  });

  return (
    <div className="bg-[#ffffff] p-3">
      <IoIosArrowRoundBack
        size={32}
        style={{ cursor: "pointer" }}
        onClick={handleBack}
      />
      <div className="p-3">
        <div className="flex">
          <div className="relative">
            <input
              type="text"
              className="border h-10 rounded-md w-80 px-3"
              placeholder="Search for medicines..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <CiSearch className="absolute right-3 top-3" />
          </div>
        </div>
        {filteredPatients.length === 0 ? (
          <div className="font-bold text-[18px] flex justify-center mt-10">
            No Medicines Found for the given search term!
          </div>
        ) : (
          <div className="mt-10">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Medicine Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Price / Tablet
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Medicine Stock
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Required-Count
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={10}>
                            <Spinner height={20} />
                          </TableCell>
                        </TableRow>
                      ))
                    : filteredPatients.map((eachMedicine) => (
                        <TableRow key={eachMedicine.id}>
                          <TableCell>
                            {highlightText(eachMedicine.name, searchTerm)}
                          </TableCell>
                          <TableCell>{eachMedicine.unit_price}</TableCell>
                          <TableCell>
                            {medicineStock.hasOwnProperty(eachMedicine.id)
                              ? medicineStock[eachMedicine.id] > 0
                                ? medicineStock[eachMedicine.id]
                                : "Out of Stock"
                              : eachMedicine.stock > 0
                              ? eachMedicine.stock
                              : "Out of Stock"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => handleDecrement(eachMedicine.id)}
                              >
                                -
                              </Button>
                              <input
                                type="text"
                                value={medicineCount[eachMedicine.id] || ""}
                                onChange={(event) =>
                                  handleCountChange(eachMedicine.id, event)
                                }
                                className="w-14 border border-gray-300 rounded p-1 focus:outline-none focus:border-blue-500"
                                min={0}
                              />
                              <Button
                                onClick={() => handleIncrement(eachMedicine.id)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        <div className="sticky bottom-0 p-3 flex justify-end shadow-md">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddAllToBasket}
          >
            Add to Basket
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
