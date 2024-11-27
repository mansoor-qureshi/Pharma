// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import MedicineDetails from "./MedicineDetails";

// const Details = () => {
//   const [medicineId, setMedicineId] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();
//   useEffect(() => {
//     const searchParams = new URLSearchParams(location.search);
//     const param = searchParams.get("id");
//     if (!param) {
//       navigate(`/page-not-found`);
//     }
//     setMedicineId(param);
//   }, [location]);
//   return (
//     <div className="flex flex-col justify-between">
//       <MedicineDetails medicineId={medicineId} />
//     </div>
//   );
// };

// export default Details;
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MedicineDetails from "./MedicineDetails";

const Details = () => {
  const [medicineId, setMedicineId] = useState(null); // Initialize as null for clarity
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const param = searchParams.get("id");
    if (!param) {
      navigate(`/page-not-found`);
    } else {
      const numericId = Number(param); // Convert to number
      if (isNaN(numericId)) {
        navigate(`/page-not-found`); // Handle invalid number case
      } else {
        setMedicineId(numericId);
      }
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col justify-between">
      {medicineId !== null && <MedicineDetails medicineId={medicineId} />}
    </div>
  );
};

export default Details;
