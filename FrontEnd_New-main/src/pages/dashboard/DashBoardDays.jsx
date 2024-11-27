import React from "react";
import { useState, useEffect } from "react";
import { basePath } from "../../constants/ApiPaths";
import { getAccessToken } from "../../common/businesslogic";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const baseBox = "flex flex-col bg-gray-200 border rounded-md flex-1 p-2";
const heading = "text-gray-400 text-md font-semibold";
const spanStyle = "w-10 text-center text-blue-600 border rounded-md";

const Today = ({ data, isLoading }) => {
  return (
    <div className="flex flex-col gap-2 ">
      <span className={heading}>TODAY</span>
      <div className="flex justify-between gap-4 flex-wrap">
        {isLoading ? (
          <>
            <Skeleton width={130} height={70} className={baseBox} />
            <Skeleton width={130} height={70} className={baseBox} />
            <Skeleton width={130} height={70} className={baseBox} />
          </>
        ) : (
          <>
            <div className={baseBox}>
              <span className="font-semibold">Ops</span>
              <span className="text-blue-600">{data?.op_count ?? "-"}</span>
            </div>
            <div className={baseBox}>
              <span className="font-semibold">Prescriptions</span>
              <div className="flex justify-start gap-3 ">
                <span className={`bg-yellow-300 ${spanStyle}`}>
                  {data?.bought ?? ""}
                </span>
                <span className={`bg-red-300 ${spanStyle}`}>
                  {data?.ignored ?? ""}
                </span>
              </div>
            </div>
            <div className={baseBox}>
              <span className="font-semibold">New Patients</span>
              <span className="text-blue-600">
                {data?.patient_count ?? "-"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Yesterday = ({ data, isLoading }) => {
  return (
    <div className="flex flex-col gap-2 mt-3 ">
      <span className={heading}>YESTERDAY</span>
      <div className="flex justify-between gap-4 flex-wrap ">
        {isLoading ? (
          <>
            <Skeleton width={130} height={70} className={baseBox} />
            <Skeleton width={130} height={70} className={baseBox} />
            <Skeleton width={130} height={70} className={baseBox} />
          </>
        ) : (
          <>
            <div className={baseBox}>
              <span className="font-semibold">Ops</span>
              <span className="text-blue-600">{data?.op_count ?? "-"}</span>
            </div>
            <div className={baseBox}>
              <span className="font-semibold">Prescriptions</span>
              <div className="flex justify-start gap-3 ">
                <span className={`bg-yellow-300 ${spanStyle}`}>
                  {data?.bought ?? ""}
                </span>
                <span className={`bg-red-300 ${spanStyle}`}>
                  {data?.ignored ?? ""}
                </span>
              </div>
            </div>
            <div className={baseBox}>
              <span className="font-semibold">New Patients</span>
              <span className="text-blue-600">
                {data?.patient_count ?? "-"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Upcoming = ({ data, isLoading }) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentDate = new Date();
  const dayOfMonth = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const arr = [1, 2, 3, 4];

  const getDate = (dateString) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const getMonth = (dateString) => {
    const date = new Date(dateString);
    return months[date.getMonth()];
  };

  return (
    <div className="flex flex-col gap-2 mt-3">
      <span className={heading}>UPCOMING OPS</span>
      <div className="flex justify-between gap-4 flex-wrap">
        {isLoading ? (
          <>
            <Skeleton width={95} height={65} />
            <Skeleton width={95} height={65} />
            <Skeleton width={95} height={65} />
            <Skeleton width={95} height={65} />
          </>
        ) : (
          data?.map((obj, index) => {
            return (
              <div className={baseBox} key={obj.date}>
                <span className="font-semibold">
                  {getMonth(obj.date)} {getDate(obj.date)}
                </span>
                <span className="text-blue-600">{obj.op_count}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const DashBoardDays = () => {
  const [ops, setOps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getOps();
  }, []);

  const getOps = async () => {
    const accessToken = getAccessToken();

    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/patient/dashboard/op`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setOps(response.data);
    } catch (error) {
      console.log("Error while getting ops", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col mb-4">
      <Today data={ops?.today} isLoading={isLoading} />
      <Yesterday data={ops?.yesterday} isLoading={isLoading} />
      <Upcoming data={ops?.upcoming_ops} isLoading={isLoading} />
    </div>
  );
};

export default DashBoardDays;
