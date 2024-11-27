import { useState, useEffect } from "react";
import { basePath } from "../constants/ApiPaths";
import { getAccessToken } from "../common/businesslogic";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const usePatientDetailsById = (id) => {
    const [patientDetails, setPatientDetails] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const accessToken = getAccessToken()

    // const { loginInfo } = useAuth()

    useEffect(() => {
        const getPatientDetails = async () => {
            try {
                setIsLoading(true)
                // const accessToken = loginInfo?.user?.access
                const response = await axios.get(`${basePath}/patient/read/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })
                setPatientDetails(response.data)
            } catch (error) {
                console.error('Error in fetching patient details')
            } finally {
                setIsLoading(false)
            }
        }
        getPatientDetails()
    }, [id])

    return { isLoading, patientDetails }
}

export default usePatientDetailsById