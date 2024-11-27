import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdOutlineModeEditOutline } from "react-icons/md";
import Skeleton from "react-loading-skeleton";
import { basePath } from "../../../constants/ApiPaths";
import CreateInventoryForm from "../CreateInventoryForm";

const textStyle = "font-bold text-lg"; // Adjusted for consistency and readability
const textValueStyle = "text-lg ml-2"; // Added margin for better spacing
const labelGroupStyle = "flex items-center mb-2"; // Common style for label-value pairs
const sectionStyle = "space-y-4"; // Added vertical spacing between sections

const DisplaySkeleton = ({ isLoading, children }) => {
  return isLoading ? (
    <div className="space-y-2">
      <Skeleton height={15} width={200} />
      <Skeleton height={15} width={200} />
      <Skeleton height={15} width={200} />
    </div>
  ) : (
    children
  );
};

const MedicineInfo = React.memo(({ medicineInfo, isLoading }) => {
  if (!medicineInfo) {
    return <p>No details available for the selected medicine.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      <div className={sectionStyle}>
        <div className={labelGroupStyle}>
          <DisplaySkeleton isLoading={isLoading}>
            <span className={textStyle}>Category Name:</span>
            <span className={textValueStyle}>
              {medicineInfo.category?.name ?? "-"}
            </span>
          </DisplaySkeleton>
        </div>
        <div className={labelGroupStyle}>
          <DisplaySkeleton isLoading={isLoading}>
            <span className={textStyle}>Product ID:</span>
            <span className={textValueStyle}>
              {medicineInfo.product_id ?? "-"}
            </span>
          </DisplaySkeleton>
        </div>
        <div className={labelGroupStyle}>
          <DisplaySkeleton isLoading={isLoading}>
            <span className={textStyle}>Medicine Name:</span>
            <span className={textValueStyle}>{medicineInfo.name ?? "-"}</span>
          </DisplaySkeleton>
        </div>
        <div className={labelGroupStyle}>
          <DisplaySkeleton isLoading={isLoading}>
            <span className={textStyle}>Dosage:</span>
            <span className={textValueStyle}>{medicineInfo.dosage ?? "-"}</span>
          </DisplaySkeleton>
        </div>
        <div className={labelGroupStyle}>
          <DisplaySkeleton isLoading={isLoading}>
            <span className={textStyle}>Price / Tablet:</span>
            <span className={textValueStyle}>
              {medicineInfo.unit_price ?? "-"}
            </span>
          </DisplaySkeleton>
        </div>
      </div>
      <div className={sectionStyle}>
        <div className={labelGroupStyle}>
          <span className={textStyle}>Expiry Date:</span>
          <span className={textValueStyle}>
            {medicineInfo.expiry_date ?? "-"}
          </span>
        </div>
        <div className={labelGroupStyle}>
          <span className={textStyle}>Quantity:</span>
          <span className={textValueStyle}>
            {medicineInfo.stock?.quantity ?? "-"}
          </span>
        </div>
      </div>
    </div>
  );
});

const MedicineDetails = ({ medicineId }) => {
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleBack = () => {
    window.history.back();
  };
  const handleClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    getMedicineInfo();
  }, [medicineId]);
  const refresh = () => {
    getMedicineInfo();
  };
  const getMedicineInfo = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/inventory/medicines`);
      if (response.data?.results) {
        const selectedMedicine = response.data?.results.find(
          (medicine) => medicine.id === medicineId
        );
        setMedicineInfo(selectedMedicine || null);
      }
    } catch (error) {
      console.error("Error fetching medicine details:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border bg-white shadow-lg p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <IoIosArrowRoundBack
          size={32}
          className="cursor-pointer"
          onClick={handleBack}
        />
        <MdOutlineModeEditOutline
          size={20}
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        />
      </div>
      <DisplaySkeleton isLoading={isLoading}>
        <MedicineInfo medicineInfo={medicineInfo} isLoading={isLoading} />
      </DisplaySkeleton>
      {open && (
        <CreateInventoryForm
          open={open}
          refresh={refresh}
          handleClose={handleClose}
          medicineInfo={medicineInfo}
        />
      )}
    </div>
  );
};

export default MedicineDetails;
