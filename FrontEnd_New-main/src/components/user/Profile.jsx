import React from "react";

import { IoIosArrowRoundBack, IoIosApps } from "react-icons/io";
import { useState, useEffect } from "react";
import axios from "axios";
import { basePath } from "../../constants/ApiPaths";
import Spinner from "../../custom/Spinner";
import { getAgeFromDate } from "../../utils/customUtils";
import { MdOutlineModeEditOutline } from "react-icons/md";
import CreateUserForm from "../user_control/CreateUserForm";
import { useAuth } from "../../context/AuthContext";
import Skeleton from "react-loading-skeleton";

const textStyle = "font-bold text-[17px]";
const textValueStyle = "text-[17px]";

const getLocalDate = (dateString) => {
  const dateObject = new Date(dateString);
  const localDate = dateObject.toLocaleDateString();
  return localDate;
};

const DisplaySkeleton = ({ isLoading, children }) => {
  return isLoading ? (
    <>
      <Skeleton height={15} width={100} />
      <Skeleton height={15} width={100} />
      <Skeleton height={15} width={100} />
    </>
  ) : (
    children
  );
};

const UserInfo = ({ userInfo, role, isLoading }) => {
  return (
    <div className="grid grid-rows-6 gap-1 md:gap-3">
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>First Name</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle}>
            {userInfo.user?.first_name ?? "-"}
            chandu
          </span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>Last Name</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle}>
            {userInfo.user?.last_name ?? "-"}
          </span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>Gender </span>
          <span className="font-bold">:</span>
          <span className={textValueStyle}>{userInfo.user?.gender ?? "-"}</span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>DOB</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle}>{userInfo.user?.dob ?? "-"}</span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>Age</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle}>
            {userInfo.user?.dob ? getAgeFromDate(userInfo.user?.dob) : "-"}
          </span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>Role</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle}>{role ?? "-"}</span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>Email</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle} style={{ wordBreak: "break-word" }}>
            {userInfo.user?.email ?? "-"}
          </span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>phoneNumber</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle} style={{ wordBreak: "break-word" }}>
            {userInfo.user?.mobile_number ?? "-"}
          </span>
        </DisplaySkeleton>
      </div>
    </div>
  );
};

const UserOtherInfo = ({ userInfo, isLoading }) => {
  return (
    <div className="grid grid-rows-6 gap-1 md:gap-3">
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>Patient ID</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle}>
            {userInfo.user?.patient_id ?? "-"}
          </span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>Visit Count</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle}>
            {userInfo.user?.visit_count ?? "-"}
          </span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className={textStyle}>Joined</span>
          <span className="font-bold">:</span>
          <span className={textValueStyle}>
            {getLocalDate(userInfo?.user?.created_at)}
          </span>
        </DisplaySkeleton>
      </div>
    </div>
  );
};

const DoctorInfo = ({ userInfo, isLoading }) => {
  return (
    <div className="grid grid-rows-6 gap-1 md:gap-3">
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className="font-bold">User Name</span>
          <span className="font-bold">:</span>
          <span>{userInfo.user?.username ?? "-"}</span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className="font-bold">Licence No</span>
          <span className="font-bold">:</span>
          <span>{userInfo.license ?? "-"}</span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className="font-bold">OP Count</span>
          <span className="font-bold">:</span>
          <span>{userInfo.op_count ?? "-"}</span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className="font-bold">Experience</span>
          <span className="font-bold">:</span>
          <span>{`${userInfo?.experience ?? 0} years` ?? "-"}</span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className="font-bold">Department</span>
          <span className="font-bold">:</span>
          <span>{userInfo.department?.name ?? "-"}</span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className="font-bold">Specialization</span>
          <span className="font-bold">:</span>
          <span>{userInfo.specialization?.name ?? "-"}</span>
        </DisplaySkeleton>
      </div>
      <div className="grid grid-cols-3">
        <DisplaySkeleton isLoading={isLoading}>
          <span className="font-bold col-span-1">Signature</span>
          <span className="font-bold col-span-1">:</span>
          <div className="col-span-1">
            <img src={userInfo?.signature} alt="signature" />
          </div>
        </DisplaySkeleton>
      </div>
    </div>
  );
};

const Profile = ({ userId, role }) => {
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { loginInfo } = useAuth();

  useEffect(() => {
    getUserInfo();
  }, [userId]);

  const getUserInfo = async () => {
    try {
      setIsLoading(true);
      const accessToken = loginInfo?.user?.access; // get access token from store
      const url =
        role == "patient"
          ? `${basePath}/patient/read/${userId}`
          : `${basePath}/doctor/read/${userId}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (role === "patient") {
        setUserInfo({ user: response.data });
        return;
      }
      setUserInfo({ ...response.data, role: "doctor" });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const refresh = () => {
    getUserInfo();
  };

  return (
    <>
      {/* {isLoading && <Spinner />} */}
      <div className="border bg-[#ffffff] shadow-lg p-3 rounded-lg">
        <div>
          <div className="flex justify-between items-center ">
            <div className="flex justify-between items-center ">
              <IoIosArrowRoundBack
                size={32}
                style={{ cursor: "pointer" }}
                onClick={handleBack}
              />
              <span className="font-bold m-2">Profile</span>
            </div>
            {role === "doctor" && (
              <div className="flex">
                <MdOutlineModeEditOutline
                  size={20}
                  style={{ marginRight: "10px", cursor: "pointer" }}
                  onClick={() => setOpen(true)}
                />
              </div>
            )}
          </div>

          <div className="flex">
            <div className="w-1/4 mr-4 flex justify-center items-center">
              <img
                className="rounded-full w-full"
                src="https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369988.png"
                alt="Circular Image"
              />
            </div>
            <div className="w-3/4 flex ">
              <div className=" w-1/2 p-5">
                <UserInfo
                  userInfo={userInfo}
                  role={role}
                  isLoading={isLoading}
                />
              </div>
              {role === "doctor" ? (
                <div className=" w-1/2 p-5">
                  <DoctorInfo userInfo={userInfo} isLoading={isLoading} />
                </div>
              ) : (
                <div className=" w-1/2 p-5">
                  <UserOtherInfo userInfo={userInfo} isLoading={isLoading} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {open && (
        <CreateUserForm
          open={open}
          handleClose={handleClose}
          refresh={refresh}
          edit={false}
          doctorInfo={userInfo}
        />
      )}
    </>
  );
};

export default Profile;
