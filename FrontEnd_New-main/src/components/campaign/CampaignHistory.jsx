import React, { useEffect, useState } from 'react';
import {
    Typography, Paper, Table, TableBody, TableCell, TableContainer,
    Snackbar, TableHead, TableRow, Button, TextField, IconButton
} from '@mui/material';
import { useParams } from 'react-router-dom'; // Import useParams hook
import axios from 'axios';
import apiConfig from '../../apiConfig';
import SendIcon from '@mui/icons-material/Send';
import Slide from '@mui/material/Slide';
import { KeyboardBackspaceOutlined } from '@mui/icons-material';
import { campaignListHeaders } from '../../utils/CampaignUtils';
import { Pagination } from '@mui/material';
import { Link } from 'react-router-dom';

const CampaignHistory = () => {
    // const history = useHistory(); // Initialize useHistory hook
    const { id } = useParams(); // Get the patient ID from the URL
    const [patientList, setPatientList] = useState([])
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        getPatientData()
    }, [id])

    const getPatientData = async () => {
        try {
            const response = await axios.get(`${apiConfig.baseURL}/patient/api/create/`, {
            });
            setPatientList(response.data)
            console.log(response.data)

        } catch (error) {
            console.error('Login error:', error);

        }
    }

    const handleBack = () => {
        window.history.back();

    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPatients = patientList.slice(startIndex, endIndex);

    return (
        <div>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <IconButton
                    onClick={handleBack}
                    style={{ float: "right" }}
                >
                    {/* Add back button icon here */}
                    <KeyboardBackspaceOutlined /> Back
                </IconButton>
                <Typography variant="h6">Campaign Details</Typography>
                <Typography>Campaign ID: 128763</Typography>
                <Typography>Campaign Name: Shaheer syed</Typography>
                <Typography>Created At: 2024-04-04</Typography>
                <Typography>Created By: Rohit</Typography>
            </Paper>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient ID</TableCell>
                            <TableCell>Patient Name</TableCell>
                            <TableCell>Mobile Number</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedPatients.map((patient) => (
                            <TableRow key={patient.id}>
                                <TableCell>
                                    <Link to={`/patient-history/${patient.id}`}>{patient.patient_id}</Link>
                                </TableCell>
                                <TableCell>{patient.patient_name}</TableCell>
                                <TableCell>{patient.mobile_number}</TableCell>
                                <TableCell>
                                    {patient.age ? patient.age : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {patient.gender ? patient.gender : 'N/A'}
                                </TableCell>
                                <TableCell>Success</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination
                count={Math.ceil(patientList.length / rowsPerPage)}
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
}

export default CampaignHistory