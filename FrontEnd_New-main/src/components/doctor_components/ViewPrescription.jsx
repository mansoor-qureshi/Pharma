import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { RxCross2 } from "react-icons/rx";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { IoIosAddCircleOutline } from "react-icons/io";
import { toast } from 'react-toastify'
import { GrSubtractCircle } from "react-icons/gr";
import axios from 'axios'
import Spinner from '../../custom/Spinner';
import { basePath } from '../../constants/ApiPaths';
import { Refresh } from '@mui/icons-material';

const ViewPrescription = ({ viewPrescription, setViewPrescription, transcription, appointmentID, refresh }) => {
  const [clinicalObservation, setClinicalObservation] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescribedMedicines, setPrescribedMedicies] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const getStatement = async () => {
      try {
        setIsLoading(true)
        const response = await axios.post(`${basePath}/doctor/statement/`,
          {
            statement: transcription
          }
        )
        setClinicalObservation(response.data.observations)
        setDiagnosis(response.data.diagnosis)
        setPrescribedMedicies(response.data.medicines)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    getStatement()

    return () => {
      clearPrescriptionData()
    }
  }, [transcription])

  const handlePrescribedMedicineChange = (e, index, key) => {
    const value = e.target.value;
    const dataSnap = [...prescribedMedicines]
    dataSnap[index][key] = value
    setPrescribedMedicies([...dataSnap])
  };

  const addRow = () => {
    setPrescribedMedicies((prev) => [...prev, { name: '', instructions: '', count: '' }])
  }

  const handleRowDelete = (deleteIndex) => {
    const dataSnap = [...prescribedMedicines]
    const filteredData = dataSnap.filter((data, index) => index !== deleteIndex)
    setPrescribedMedicies([...filteredData])
  }

  const handleTableValidation = () => {
    let error = false
    if (prescribedMedicines.length == 0) {
      toast.warn('please add atleast one medicine')
      return true
    }
    for (let i = 0; i < prescribedMedicines.length; i++) {
      const row = prescribedMedicines[i];

      for (const key in row) {
        if (row[key] === '') {
          error = true;
          break;
        }
      }

      if (error) {
        break;
      }
    }
    if (error) {
      toast.warn('please fill all fields in prescribed medicines')
      return true
    }
    return false
  }

  const clearPrescriptionData = () => {
    setClinicalObservation('')
    setDiagnosis('')
    setPrescribedMedicies([])
  }

  const sendPrescription = async (e) => {
    e.preventDefault()
    if (clinicalObservation.trim() == '') {
      toast.warn('please fill clinical observation')
      return
    }
    if (diagnosis.trim() == '') {
      toast.warn('please fill diagnosis')
      return
    }
    const validationFailed = handleTableValidation()
    if (validationFailed) {
      return
    }

    try {
      setIsLoading(true)
      const payload = {
        observations: clinicalObservation,
        diagnosis: diagnosis,
        medicines: [...prescribedMedicines]
      }

      const response = await axios.put(`${basePath}/patient/appointment/prescription/${appointmentID}`, { ...payload })
      toast.success('presciption sent successfully')
      setViewPrescription(false)
      clearPrescriptionData()
      refresh()
    } catch (error) {
      toast.error('something went wrong')
      console.error('error in sending pescription')
    } finally {
      setIsLoading(false)
    }


  }

  return (
    <div>
      {isLoading && <Spinner />}
      <Dialog fullWidth open={viewPrescription} onClose={() => setViewPrescription(false)}>
        <DialogTitle >
          <div className='flex justify-end'>
            <RxCross2
              onClick={() => setViewPrescription(false)}
              className='cursor-pointer'
            />
          </div>
        </DialogTitle>
        <DialogContent className=" mb-3">
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <span>Clinical Observations</span>
              <TextField
                label=""
                variant="outlined"
                value={clinicalObservation}
                onChange={(e) => setClinicalObservation(e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <span>Diagnosis</span>
              <TextField
                label=""
                variant="outlined"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex justify-between'>
                <span>Prescribed Medicines</span>
                <IoIosAddCircleOutline
                  size={24}
                  className='mr-5 cursor-pointer'
                  onClick={addRow}
                />
              </div>
              <EditableTable
                prescribedMedicines={prescribedMedicines}
                handlePrescribedMedicineChange={handlePrescribedMedicineChange}
                handleRowDelete={handleRowDelete}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="mb-3">
          <button
            className={`text-white py-2 px-4 mr-3 rounded bg-blue-500 hover:bg-blue-700`}
            onClick={sendPrescription}
          >
            Send
          </button>
        </DialogActions>
      </Dialog>
    </div >
  )
}

export default ViewPrescription;



const EditableTable = ({ prescribedMedicines, handlePrescribedMedicineChange, handleRowDelete }) => {

  return (
    <div style={{ overflow: 'auto', maxHeight: '250px', width: '100%' }}>
      <div style={{ minWidth: '100%', display: 'inline-block' }}>
        <TableContainer component={Paper} className='border'>
          <Table>
            <TableHead>
              <TableRow className='bg-gray-200'>
                <TableCell>Name</TableCell>
                <TableCell>Instructions</TableCell>
                <TableCell>Count</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescribedMedicines.map((row, index) => (
                <TableRow key={`row-${index}`}>
                  <TableCell>
                    <input
                      type="text"
                      className='border p-3'
                      value={row.name}
                      onChange={(e) => handlePrescribedMedicineChange(e, index, 'name')}
                      key={`name-${index}`}
                      style={{ width: '300px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      className='border p-3'
                      value={row.instructions}
                      onChange={(e) => handlePrescribedMedicineChange(e, index, 'instructions')}
                      key={`instructions-${index}`}
                      style={{ width: '300px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      className='border p-3 '
                      value={row.count}
                      onChange={(e) => handlePrescribedMedicineChange(e, index, 'count')}
                      key={`count-${index}`}
                      style={{ width: '50px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <GrSubtractCircle
                      className='cursor-pointer'
                      onClick={() => handleRowDelete(index)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

