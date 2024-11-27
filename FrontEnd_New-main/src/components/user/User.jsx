import React from 'react';
import { useState, useEffect } from "react"
import Profile from "./Profile"
import { useLocation } from 'react-router-dom';
import DoctorAppointemts from "../doctor_components/DoctorAppointments";
import { useNavigate } from 'react-router-dom';

const User = () => {
    const [userId, setUserId] = useState('')
    const navigate = useNavigate()

    const location = useLocation();
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const param1 = searchParams.get('id');
        if (!param1) {
            navigate(`/page-not-found`)  // routes to /*
        }
        setUserId(param1)
    }, [location]);

    return (
        <div className="flex flex-col justify-between">
            <Profile userId={userId} role="doctor" />
           
        </div>
    )
}

export default User