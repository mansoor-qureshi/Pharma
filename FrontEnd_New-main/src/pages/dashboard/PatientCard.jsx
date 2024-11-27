import React, { useState, useEffect } from "react"
import { TbReportSearch } from "react-icons/tb";
import { AiOutlineRise } from "react-icons/ai";
import DonutChart from 'react-donut-chart';
import axios from "axios";
import { basePath } from "../../constants/ApiPaths";
import Spinner from "../../custom/Spinner";
import { getAccessToken } from "../../common/businesslogic";

const PatientCard = () => {

    const [cardDetails, setCardDetails] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchCountDetails()
    }, [])

    const fetchCountDetails = async () => {
        const accessToken = getAccessToken()
        try {
            setIsLoading(true)
            const response = await axios.get(`${basePath}/patient/doctor/count`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            setCardDetails(response.data)
        } catch (error) {
            console.error(`error in fetching count details in dashboard`, error)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-2">
            {isLoading && <Spinner />}
            <div className="col-span-1 ">
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-2">
                    <div><Card text={"Total Doctors"} count={cardDetails?.doctor_count ?? '-'} /></div>
                    <div><Card text={"Surgery"} count={164} /></div>
                    <div><Card text={"Total Patients"} count={cardDetails?.patient_count ? (cardDetails?.patient_count?.male + cardDetails?.patient_count?.female) : ''} /></div>
                    <div><Card text={"Reports"} count={973} /></div>
                </div>
            </div>
            <div className="border-2 col-span-1 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="font-bold">Patient Gender</span>
                </div>
                <div className="flex justify-center items-center mt-5">
                    <MyChart cardDetails={cardDetails} />
                </div>
            </div>
        </div>
    )
}

export default PatientCard

const Card = ({ text, count }) => {

    const getTodayDate = () => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
        };

        const formattedDate = new Date().toLocaleDateString('en-US', options);
        return formattedDate
    }

    return (
        <div className="flex flex-col justify-between items-center border-2 rounded-lg gap-4 h-full">
            <div className="flex justify-between items-start gap-5 p-3">
                <div className="">
                    <TbReportSearch size={40} className="border rounded-lg p-1" />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-[18px] font-semibold">{text}</div>
                    <div className="text-[30px] font-semibold">{count}</div>
                </div>
            </div>
            <div className="flex gap-4 items-center p-2 ">
                <div className="">{getTodayDate()}</div>
                <div className="flex justify-between gap-1 items-center">
                    <AiOutlineRise />
                    <span className="text-green-400">2.05 %</span>
                </div>
            </div>
        </div>

    )
}
const MyChart = ({ cardDetails }) => {



    // const data = [
    //     { label: 'A', value: 10 },
    //     { label: 'B', value: 20 },
    //     { label: 'C', value: 30 },
    // ];

    const data = Object.entries(cardDetails?.patient_count || {}).map(([key, value]) => {
        return { label: key, value: value }
    })


    const colors = ["#2196F3", "#1976D2", "#1565C0"];



    return (
        <div style={{ width: "300px", height: '250px' }}>
            <DonutChart
                data={data}
                width={350}
                height={350}
                innerRadius={0.5}
                colors={colors}
                labelStyle={{ fontSize: '26px' }}
                className='flex justify-center gap-2 text-[14px]'
            />
        </div>
    );



};





