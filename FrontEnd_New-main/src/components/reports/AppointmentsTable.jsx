import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Grid, css } from '@mui/material';
import { Pagination } from '@mui/material';
import { Link } from 'react-router-dom';
import { getAgeFromDate } from '../../utils/customUtils';
import Skeleton from 'react-loading-skeleton';

const AppointmentsTable = ({ appointments, isLoading }) => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 5));
        setPage(1);
    };

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedAppointments = appointments?.slice(startIndex, endIndex);


    return (
        <div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow   >
                            <TableCell sx={{ fontWeight: 'bold' }}>Patient Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Doctor Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Start Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>End Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Doctor Department</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Days</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell colSpan={9}>
                                    <Skeleton height={20} />
                                </TableCell>
                            </TableRow>
                        ))) : paginatedAppointments?.map((appointment) => (
                            <TableRow key={appointment.id} className='hover:bg-blue-100 cursor-pointer'>
                                <TableCell>
                                    <Link to={`/patient-history/${appointment.patient.id}`} className='text-blue-500'>{appointment?.patient?.first_name} {appointment?.patient?.last_name}</Link>
                                </TableCell>
                                <TableCell>{appointment?.doctor?.user?.username ?? '-'}</TableCell>
                                <TableCell>{appointment?.date ?? '-'}</TableCell>
                                <TableCell>{appointment?.start_time ?? '-'}</TableCell>
                                <TableCell>{appointment.end_time ?? '-'}</TableCell>
                                <TableCell>{appointment?.doctor?.department?.name ?? '-'}</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>{appointment?.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination
                count={Math.ceil(appointments?.length / rowsPerPage)}
                page={page}
                onChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                style={{ marginTop: 20 }}
            />
        </div>
    );
};

export default AppointmentsTable