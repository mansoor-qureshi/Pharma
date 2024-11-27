import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';
import apiConfig from '../apiConfig';
import axios from 'axios';
import React from 'react';


function preventDefault(event) {
  event.preventDefault();
}

export default function PatientCount() {
  const [patientCount, setPatientCount] = React.useState(0)
  React.useEffect(() => {
    getPatientCount()
  })
  const getPatientCount = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/patient/api/patient-count/`);
      console.log(response)
      setPatientCount(response.data.total_count)

    }
    catch (error) {
      console.log(error)
    }
  }
  return (
    <React.Fragment>
      <Title align='center'>Total Patients</Title>
      <Typography component="p" variant="h4" align='center'>
        {patientCount}
      </Typography>
    </React.Fragment>
  );
}