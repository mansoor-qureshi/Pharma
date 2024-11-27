

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiConfig from '../apiConfig';
import { TextField, Typography, Box, Grid, MenuItem } from '@mui/material';
import ReactApexChart from 'react-apexcharts';

const DonutChart = ({ data }) => {
    const chartOptions = {
        labels: data.map(item => item.label),
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '22px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 600,
                            color: undefined,
                            offsetY: -10
                        },
                        value: {
                            show: 'hover', // Show value on hover
                            fontSize: '16px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 400,
                            color: undefined,
                            offsetY: 16,
                            formatter: function (val) {
                                return val;
                            }
                        },

                        chart: {
                            width: 600 || '100%',
                            height: 500 || 'auto',
                            type: 'donut'
                        },
                        // total: {
                        //   show: true,
                        //   label: 'Total',
                        //   color: '#373d3f',
                        //   formatter: function (w) {
                        //     return w.globals.seriesTotals.reduce((a, b) => {
                        //       return a + b;
                        //     }, 0);
                        //   }
                        // }
                    }
                }
            }
        }
    };


    const chartSeries = data.map(item => item.value);

    return (
        <div>
            <ReactApexChart options={chartOptions} series={chartSeries} type="donut" />
        </div>
    );
};



export default function DonutActiveArc() {
    const [data, setData] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [filterDoctorId, setFilterDoctorId] = useState('')
    const [filterDepart, setFilterDepart] = useState('')

    useEffect(() => {
        getDashboardData('', '', '');
        // const fetchDoctors = async () => {
        //     try {
        //         const response = await axios.get(`${apiConfig.baseURL}/patient/api/doctors/`);
        //         // setDoctors(response.data);
        //         setFilteredDoctors(response.data);
        //     } catch (error) {
        //         console.error('Error fetching doctors:', error);
        //     }
        // };
        // const fetchDepartments = async () => {
        //     try {
        //         const response = await axios.get(`${apiConfig.baseURL}/user/api/department/`);
        //         // setDoctors(response.data);
        //         setFilteredDepartments(response.data);
        //     } catch (error) {
        //         console.error('Error fetching doctors:', error);
        //     }
        // };
        // fetchDoctors()
        // fetchDepartments()
    }, []);

    // const getDashboardData = async (date, doctor_id, depart) => {
    //     try {
    //         const response = await axios.get(`${apiConfig.baseURL}/patient/api/dashboard/?doctor_id=${doctor_id}&department=${depart}`);
    //         console.log(response.data.dashboard_counts)
    //         if (response.status === 200) {
    //             setData(response.data.dashboard_counts);
    //         }
    //         setLoading(false); // Set loading to false once data is fetched
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //         setLoading(false); // Set loading to false in case of an error
    //     }
    // };

    const handleDateChange = (event) => {
        const { name, value } = event.target;
        if (name === 'date') {
            setFilterDate(value);
            getDashboardData(value, filterDoctorId, filterDepart);
        }
        if (name === 'doctor') {
            setFilterDoctorId(value);
            getDashboardData(filterDate, value, filterDepart);
        }
        if (name === 'department') {
            setFilterDepart(value);
            getDashboardData(filterDate, filterDoctorId, value);
        }
        setLoading(true); // Set loading to true when date or doctor changes to indicate loading state
        // getDashboardData(filterDate, filterDoctorId);
    };

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Filter by Date"
                        type="date"
                        name='date'
                        value={filterDate}
                        onChange={handleDateChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{ width: '100%' }}
                    />
                </Grid>
                {/* Add filters for doctors and departments here */}
                <Grid item xs={12} md={4}>
                    {/* Doctor filter */}
                    <TextField
                        select
                        label="Doctor"
                        name="doctor"
                        // value={formData.doctor}
                        onChange={handleDateChange}
                        fullWidth
                    >
                        {filteredDoctors.map((doctor) => (
                            <MenuItem key={doctor.id} value={doctor.id}>
                                {doctor.username}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                    {/* Department filter */}
                    <TextField
                        select
                        label="Department"
                        name="department"
                        // value={formData.doctor}
                        onChange={handleDateChange}
                        fullWidth
                    >
                        {filteredDepartments.map((department) => (
                            <MenuItem key={department.id} value={department.id}>
                                {department.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height={200}
                    >
                        {loading ? (
                            <Typography variant="body1">Loading...</Typography>
                        ) : data.length === 0 ? (
                            <Typography variant="body1">No data found.</Typography>
                        ) : (
                            <DonutChart data={data} />
                        )}
                    </Box>
                </Grid>
                {/* Add more charts here */}
                {/* <Grid item xs={12} md={6}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height={200}
                >
                    {loading ? (
                        <Typography variant="body1">Loading...</Typography>
                    ) : data.length === 0 ? (
                        <Typography variant="body1">No data found.</Typography>
                    ) : (
                        <OtherChart data={data} />
                    )}
                </Box>
            </Grid> */}
            </Grid>
            {/* ); */}
        </>
    );
}
