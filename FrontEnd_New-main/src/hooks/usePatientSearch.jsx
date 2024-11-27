import { useState, useEffect } from "react";
import { basePath } from "../constants/ApiPaths";
import { getAccessToken } from "../common/businesslogic";
import axios from "axios";

const usePatientSearch = (searchValue, delay) => {
  const [patientList, setPatientList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const accessToken = getAccessToken();

  const searchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${basePath}/patient/search/`,
        {
          params: {
            search: searchValue,
          },
        },
        {
          headers: {
            Authorization: accessToken,
          },
        }
      );
      setPatientList(response.data);
    } catch (error) {
      console.error("error in fetching patients by searching", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchPatients();
    }, delay);

    return () => {
      clearTimeout(timeout);
      setPatientList([]);
    };
  }, [searchValue]);

  return { isLoading, patientList };
};

export default usePatientSearch;
