import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import InventoryList from "../components/inventory/InventoryList";
import CreateInventoryForm from "../components/inventory/CreateInventoryForm";
import { basePath } from "../constants/ApiPaths";

const baseStyle =
  "border rounded-full cursor-pointer min-w-36 px-1 min-h-9 text-center flex items-center justify-center font-sans capitalize";

const Inventory = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // Search term retained for UI
  const [medicineList, setMedicineList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState("");

  // Fetch Medicines by Category
  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      setError(""); // Clear any previous error
      let apiEndpoint = `${basePath}/inventory/medicines`;

      // Append category filter to the API URL
      if (selectedItem !== "all") {
        apiEndpoint += `?category_id=${selectedItem}`;
      }

      const response = await axios.get(apiEndpoint);
      setMedicineList(response.data?.results || []);
    } catch (error) {
      console.error("Error fetching medicines:", error.message);
      setError("Failed to fetch medicines. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Categories on Initial Load
  const fetchCategoryList = async () => {
    try {
      setIsLoading(true);
      setError(""); // Clear any previous error
      const response = await axios.get(`${basePath}/inventory/category`);
      setCategoryList(response.data || []);
    } catch (error) {
      console.error("Error fetching category list:", error.message);
      setError("Failed to fetch categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Medicines when Selected Category Changes
  useEffect(() => {
    fetchMedicines();
  }, [selectedItem]);

  // Fetch Categories on Initial Component Load
  useEffect(() => {
    fetchCategoryList();
  }, []);

  // Open/Close Modal for Adding New Inventory
  const handleCreateFields = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="w-full h-full p-3 border bg-[#ffffff]">
      <div className="p-3 flex flex-col gap-10">
        <div className="flex justify-between items-center">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              className="border h-10 rounded-md w-80 px-3"
              placeholder="Search for medicines..."
              onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm locally
            />
            <CiSearch className="absolute right-3 top-3" />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateFields}
          >
            Create New Inventory
          </Button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Category Buttons */}
          <div className="flex flex-wrap gap-3 w-full">
            {/* "All" Button */}
            <div
              className={`${baseStyle} ${
                selectedItem === "all"
                  ? "bg-blue-500 text-white border-blue-800"
                  : ""
              }`}
              onClick={() => setSelectedItem("all")}
            >
              All
            </div>

            {/* Dynamically Render Category Buttons */}
            {(showAll ? categoryList : categoryList.slice(0, 5)).map(
              (category) => (
                <div
                  className={`${baseStyle} ${
                    selectedItem === category.id
                      ? "bg-blue-500 text-white border-blue-800"
                      : ""
                  }`}
                  key={category.id}
                  onClick={() => setSelectedItem(category.id)}
                >
                  {category.name}
                </div>
              )
            )}
            {categoryList.length > 5 && (
              <div
                className={`${baseStyle} bg-gray-200 text-gray-600`}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : "View All"}
              </div>
            )}
          </div>

          {/* Inventory List */}
          {error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <InventoryList
              isAllCatagoryList={medicineList}
              isLoading={isLoading}
              refresh={fetchMedicines}
            />
          )}

          {/* Show "No Medicines Found" Message */}
          {!isLoading && medicineList.length === 0 && (
            <div className="text-center text-gray-500">
              No medicines found for this category.
            </div>
          )}
        </div>
      </div>

      {/* Create Inventory Modal */}
      {open && <CreateInventoryForm open={open} handleClose={handleClose} />}
    </div>
  );
};

export default Inventory;
