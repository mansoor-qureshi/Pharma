import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../apiConfig';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { basePath } from '../constants/ApiPaths';
import Spinner from '../custom/Spinner';
import { toast } from 'react-toastify';
import { getAccessToken } from '../common/businesslogic';

const QualificationList = () => {
  const [qualification, setQualification] = useState([]);
  const [newQualification, setNewQualification] = useState('');
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${basePath}/doctor/specialization`);
      setQualification(response.data);
    } catch (error) {
      console.error('Error fetching qualificaion:', error);
    } finally {
      setIsLoading(false)
    }
  };

  const handleQualification = async () => {
    if (newQualification.trim() === '') {
      toast.error('Please enter a Qualification name.');
      return;
    }

    const accessToken = getAccessToken()

    try {
      setIsLoading(true)
      await axios.post(`${basePath}/doctor/specialization/`, { name: newQualification }, { headers: { Authorization: `Bearer ${accessToken}` } });
      setNewQualification('');
      fetchQualifications()
      toast.success('Qualification added successfully')
      console.log('hello')
    } catch (error) {
      console.error('Error adding department:', error);
      if (error.response.status == 400) {
        toast.error(error.response.data.name[0])
      }
      if (error.response.status == 500) {
        toast.error('something went wrong')
      }
    } finally {
      setIsLoading(false)
    }
  };

  const getLocalDate = (dateString) => {
    const dateObject = new Date(dateString);
    const localDate = dateObject.toLocaleDateString()
    return localDate
  }



  return (
    <div className='border bg-[#ffffff] p-5'>
      {isLoading && <Spinner />}
      <span className='font-bold text-[20px]'>Qualification List</span>
      <div className='flex justify-end items-center gap-5 mt-5'>
        {/* <TextField
          label="Enter Qualification Name"
          variant="outlined"
          value={newQualification}
          onChange={(e) => setNewQualification(e.target.value)}
          style={{ marginBottom: '10px' }}
        /> */}
        <input
          type="text "
          className='border h-10 rounded-md w-80 px-3'
          placeholder='Enter Qualification Name '
          value={newQualification}
          onChange={(e) => setNewQualification(e.target.value)}

        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleQualification}
        >
          Add Qualification
        </Button>

      </div>

      <div className='mt-10'>
        {qualification.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Qualification Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qualification.map((qualificaion) => (
                  <TableRow key={qualificaion.id}>
                    <TableCell>{qualificaion.name}</TableCell>
                    <TableCell>{qualificaion?.created_by?.username}</TableCell>
                    <TableCell>{qualificaion?.created_at ? getLocalDate(qualificaion.created_at) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p>No Qualification added yet.</p>
        )}
      </div>
    </div>
  );
};

export default QualificationList;
