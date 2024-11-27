import React from "react";
import Profile from "../../assets/profileImage-dashboard.png";
import "./TodayAppointmentCard.css";
import Skeleton from "react-loading-skeleton";
import { SkeletonTheme } from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";

const TodayAppointmentCard = ({ appointments, isLoading }) => {
  const navigate = useNavigate();
  const handleNavigate = (id) => {
    navigate(`/patient-history/${id}`);  // <-- Use navigate to go to the correct page
  };
  return (
    <>
      <div className="flex flex-col justify-start rounded-lg shadow-lg border-2 p-4 bg-[#eceffd]">
        <span className="text-[#6589da] font-semibold text-[18px]">
          Today Appointments
        </span>
        {!isLoading && appointments?.length === 0 ? (
          <div className="flex justify-center items-center h-full text-[18px] font-semibold">
            No appointments available ! ...
          </div>
        ) : (
          <div className="appointments-table-container">
            <table className="w-full">
              <thead className="bg-[#eceffd]">
                <tr className="text-left">
                  <th className="font-semibold">Patient</th>
                  <th className="font-semibold pl-5">Name/Diagnosis</th>
                  <th className="font-semibold text-center">Time</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <LoadSkeleton size={6} />
                ) : (
                  appointments.map((appointment, index) => {
                    return (
                      <tr className="text-left" key={`${index}-appointment`}>
                        <td>
                          <div className="flex items-center mt-3">
                            <img
                              src={Profile}
                              alt="profile image"
                              className="w-12 h-12 object-cover rounded-full"
                            />
                          </div>
                        </td>
                        <td className="pl-5">
                          <div className="flex flex-col items-start mt-3">
                            <div
                              className="font-bold text-[14px] text-[#4368cd] cursor-pointer"
                              onClick={() =>
                                handleNavigate(appointment.patient.id)
                              }
                            >
                              {appointment?.patient?.first_name ?? "-"}{" "}
                              {appointment?.patient?.last_name ?? "-"}
                            </div>
                            <span className="text-[14px]">Health checkup</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="bg-[#cbd6f4] text-[#6488d9] rounded-md text-[16px] font-semibold p-2 mt-3">
                            {appointment?.start_time}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(TodayAppointmentCard);

const LoadSkeleton = ({ size }) => {
  return Array.from(new Array(size)).map((_, index) => (
    <SkeletonTheme
      baseColor="#cfe0f9"
      highlightColor="#e0f2fe"
      key={`${index}-appointment-skeletontheme`}
    >
      <tr className="text-left" key={`${index}-appointment-skeleton`}>
        <td>
          <Skeleton circle={true} height={50} width={50} />
        </td>
        <td className="pl-5">
          <div className="flex flex-col items-start mt-3">
            <Skeleton height={10} width={50} />
            <Skeleton height={10} width={100} />
          </div>
        </td>
        <td className="text-center">
          <Skeleton height={30} width={100} />
        </td>
      </tr>
    </SkeletonTheme>
  ));
};
