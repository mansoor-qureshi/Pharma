import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import axios from 'axios';
import apiConfig from '../apiConfig';
import React from 'react';
import { basePath } from '../constants/ApiPaths';

export default function RecentAppointments() {
  const [appointmentRows, setAppointmentRows] = React.useState([])

  React.useEffect(() => {
    getAppointments()
  }, [])

  const getAppointments = async () => {
    try {
      // const response = await axios.get(`${apiConfig.baseURL}/patient/api/recent-appointment/`);
      const response = await axios.get(`${basePath}/patient/appointment/recent`);
      console.log(response)
      setAppointmentRows(response.data.results)
    }
    catch (error) {
      console.log(error)
    }

  }
  return (
    <div >
      <Title>Recent Appointments</Title>
      <Table className='mb-4'>
        <TableHead>
          <TableRow className='bg-gray-200'>
            <TableCell>Date</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Visiting Time</TableCell>
            <TableCell>visiting Doctor</TableCell>
            <TableCell>visiting Department</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointmentRows.map((row) => (
           
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.patient_name}</TableCell>
              <TableCell>{row.start_time}</TableCell>
              <TableCell>{row.doctor_name}</TableCell>
              <TableCell>{row.doctor_department}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    </div>
  );
}