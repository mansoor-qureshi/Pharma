import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    Grid, MenuItem, Typography
} from '@mui/material';
import { IoClose } from "react-icons/io5";
import { basePath } from '../../constants/ApiPaths'
import { toast } from 'react-toastify'
import Spinner from '../../custom/Spinner'



const PatientStatusForm = ({ open, handleClose, appointmentID, refresh }) => {

    const [formData, setFormData] = useState({
        weight: '',
        temperature: '',
        bpSystolic: '',
        bpDiastolic: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [formErrors, setFormErrors] = useState({})

    useEffect(() => {
        return () => {
            clearForm()
        }
    }, [])

    const clearForm = () => {
        setFormData({
            weight: '',
            temperature: '',
            bpSystolic: '',
            bpDiastolic: ''
        })
    }

    const handleChange = (event) => {
        let { name, value } = event.target;
        let containsNonDigits = /\D/.test(value);

        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: "" })
        }

        if (!containsNonDigits && value.length <= 3) {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const validateStatsForm = () => {
        const errors = {};

        let requiredFields = Object.entries(formData).map(([key, value]) => key)

        requiredFields.forEach((field) => {
            if (formData[field] == '') {
                errors[field] = 'This field is required'
            }
        })

        return errors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        let errors = validateStatsForm()
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setIsLoading(true)
            const payload = {
                id: appointmentID,
                body_details: {
                    temperature: formData.temperature,
                    weight: formData.weight,
                    blood_pressure: `${formData.bpSystolic}/${formData.bpDiastolic}`
                }
            }
            const response = await axios.post(`${basePath}/patient/appointment/bodydetails/`,
                {
                    ...payload
                }
            )
            toast.success('stats added successfully')
            refresh()
            handleClose()
        } catch (error) {
            console.error(`error in adding patient stats`, error)
            toast.error('something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            {isLoading && <Spinner />}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle className='flex justify-between'>
                    <span>Patient Stats</span>
                    <IoClose
                        size={24}
                        onClick={handleClose}
                        className='cursor-pointer'
                    />
                </DialogTitle>
                <DialogContent className='mt-3'>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Weight"
                                    fullWidth
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    error={!!formErrors.weight}
                                    helperText={formErrors.weight}
                                    required
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Temperature"
                                    fullWidth
                                    name="temperature"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    error={!!formErrors.temperature}
                                    helperText={formErrors.temperature}
                                    required
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item xs={5}>
                                        <TextField
                                            label="Systolic BP"
                                            fullWidth
                                            name="bpSystolic"
                                            value={formData.bpSystolic}
                                            onChange={handleChange}
                                            error={!!formErrors.bpSystolic}
                                            helperText={formErrors.bpSystolic}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={1} container justifyContent="center">
                                        <Typography>/</Typography>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <TextField
                                            label="Diastolic BP"
                                            fullWidth
                                            name="bpDiastolic"
                                            value={formData.bpDiastolic}
                                            onChange={handleChange}
                                            error={!!formErrors.bpDiastolic}
                                            helperText={formErrors.bpDiastolic}
                                            required
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <DialogActions className='flex justify-end mt-3'>
                            <Button onClick={handleClose} color="secondary">Cancel</Button>
                            <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>Create</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default PatientStatusForm;
