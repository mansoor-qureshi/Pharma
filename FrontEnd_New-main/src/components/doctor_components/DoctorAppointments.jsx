import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow
} from '@mui/material';
import axios from 'axios';
import apiConfig from '../../apiConfig';
import { Pagination } from '@mui/material';

const DoctorAppointemts = ({ doctorId }) => {
    const [appointments, setAppointments] = useState([])
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        getPatientHistory()
    }, [doctorId])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 5));
        setPage(1);
    };

    const getPatientHistory = async () => {
        try {
            let url = `${apiConfig.baseURL}/patient/api/patient-details/${20}`;
            const response = await axios.get(url, {});
            console.log(response.data);
            let patient = response.data

            setAppointments([...patient.appointments])
        } catch (error) {
            console.error('error:', error);
        }
    }

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedAppointments = appointments.slice(startIndex, endIndex);

    return (
        <div>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow className="bg-gray-200">
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Visit Doctor</TableCell>
                            <TableCell>BP</TableCell>
                            <TableCell>Temperature</TableCell>
                            <TableCell>Weight</TableCell>
                            <TableCell>Department</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedAppointments.map((appointment, index) => (
                            <TableRow key={index}>
                                <TableCell>{appointment.appointment_date}</TableCell>
                                <TableCell>{appointment.appointment_time}</TableCell>
                                <TableCell>{appointment.doctor ? appointment.doctor.username : 'N/A'}</TableCell>
                                <TableCell>{appointment.bp ? appointment.bp : 'N/A'}</TableCell>
                                <TableCell>{appointment.temp ? appointment.temp : 'N/A'}</TableCell>
                                <TableCell>{appointment.weight ? appointment.weight : 'N/A'}</TableCell>
                                <TableCell>{appointment.doctor && appointment.doctor.department ? appointment.doctor.department.name : 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination
                count={Math.ceil(appointments.length / rowsPerPage)}
                page={page}
                onChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                style={{ marginTop: 20 }}
            />
        </div>
    )
}

export default DoctorAppointemts