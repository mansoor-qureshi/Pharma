import React from "react";
import Profile from "../../assets/profileImage-dashboard.png";
import { IoCallOutline } from "react-icons/io5";
import { HiOutlineDocumentArrowDown } from "react-icons/hi2";
import { BsChatDots } from "react-icons/bs";
import useRecentAppointment from "../../hooks/useRecentAppointment";
import Spinner from "../../custom/Spinner";
import usePatientDetailsById from "../../hooks/usePatientDetailsById";

const NextPatientDetailsCard = ({ nextPatientId }) => {
  const { isLoading, patientDetails } = usePatientDetailsById(nextPatientId);

  const getSex = (sex) => {
    const data = { M: "Male", F: "Female", O: "Others" };
    return data[sex];
  };

  const getDOBInStringFormat = (date) => {
    // const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const dob = new Date(date);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const dateString = dob.toLocaleDateString(undefined, options);
    return dateString;
  };

  return (
    <>
      {isLoading && <Spinner />}
      <div className="flex flex-col gap-3 justify-start rounded-lg shadow-lg border-2 p-4  bg-[#eceffd] ">
        <span className="text-[#6589da] font-semibold text-[18px]">
          Next Patient Details
        </span>
        {patientDetails ? (
          <>
            <div className="flex justify-between items-center flex-wrap">
              <span className="flex items-center">
                <img
                  src={Profile}
                  alt="profile image"
                  className="w-12 h-12 object-cover rounded-full"
                />
              </span>
              <div className="flex flex-col items-start">
                <span className="font-bold text-[14px] text-[#4368cd]">
                  {patientDetails?.first_name} {patientDetails?.last_name}
                </span>
                <span className="text-[14px]">Health checkup</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-[14px] text-[#4368cd]">
                  Patient ID
                </span>
                <span className="text-[14px]">
                  {patientDetails?.patient_id}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 flex-wrap">
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-[14px]">DOB</span>
                <span className="text-[14px]">
                  {getDOBInStringFormat(patientDetails?.dob)}
                </span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-[14px]">Sex</span>
                <span className="text-[14px]">
                  {patientDetails?.gender
                    ? getSex(patientDetails?.gender)
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-[14px] ">Weight</span>
                <span className="text-[14px]">
                  {patientDetails?.weight ?? "-"}
                </span>
              </div>
            </div>
            <div className="flex justify-between mt-2 flex-wrap">
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-[14px]">
                  Last Appointment
                </span>
                <span className="text-[14px]">15 Dec - 2021</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-[14px]">Height</span>
                <span className="text-[14px]">172 cm</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-[14px] ">Reg Date</span>
                <span className="text-[14px]">10 Dec 2021</span>
              </div>
            </div>
            <div className="flex flex-col mt-3 gap-2">
              <span className="text-[#4368cd] font-semibold text-[16px]">
                Patient History
              </span>
              <div className="flex justify-even gap-3 flex-wrap text-center">
                <div className="flex flex-grow justify-even items-center gap-2 p-2 bg-[#0d46c1] text-[12px] rounded-md w-100">
                  <IoCallOutline className="text-white" />
                  <span className="text-white">
                    {patientDetails?.mobile_number}
                  </span>
                </div>
                <div className="flex flex-grow justify-even items-center gap-2 p-2 border-2 border-blue-500 text-[12px] rounded-md w-75">
                  <HiOutlineDocumentArrowDown className="text-blue-500" />
                  <span className="text-blue-600 font-semibold">Document</span>
                </div>
                <div className="flex flex-grow justify-even items-center gap-2 p-2 border-2 border-blue-500  text-[12px] rounded-md w-50">
                  <BsChatDots className="text-blue-500" />
                  <span className="text-blue-600 font-semibold">
                    Last Prescription
                  </span>
                </div>
              </div>
            </div>
            <span className="text-blue-600 cursor-pointer text-[14px] font-semibold mt-2">
              Last Prescriptions
            </span>
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-[18px] font-semibold">
            No Details Available !...
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(NextPatientDetailsCard);
