import { useState, useEffect } from "react";
import { basePath } from "../constants/ApiPaths";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getAccessToken } from "../common/businesslogic";

const usePincodes = () => {
    const [pinCodes, setPinCodes] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const accessToken = getAccessToken()

    // const { loginInfo } = useAuth()

    useEffect(() => {
        const getPincodes = async () => {
            try {
                setIsLoading(true)
                // const accessToken = loginInfo?.user?.access
                const response = await axios.get(`${basePath}/patient/pincodes/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })
                setPinCodes(response.data?.pincodes)
            } catch (error) {
                console.error('Error in fetching pincodes')
            } finally {
                setIsLoading(false)
            }
        }
        getPincodes()
    }, [])

    return { isLoading, pinCodes }
}

export default usePincodes