import { useState, useEffect } from "react";
import { basePath } from "../constants/ApiPaths";
import axios from "axios";

const useRecentAppointment = (startDate, endDate) => {
    const [appointments, setAppointMents] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const user = JSON.parse(localStorage.getItem('user'))
    const accessToken = user?.access


    useEffect(() => {
        const getRecentAppointments = async () => {
            try {
                setIsLoading(true)
                const response = await axios.get(`${basePath}/patient/appointment/recent`, {
                    params: {
                        start_date: startDate,
                        end_date: endDate
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })
                setAppointMents(response.data?.results)
            } catch (error) {
                console.log('error in fetching recent appointments')
            } finally {
                setIsLoading(false)
            }
        }
        getRecentAppointments()
    }, [startDate, endDate])

    return { isLoading, appointments }
}

export default useRecentAppointment