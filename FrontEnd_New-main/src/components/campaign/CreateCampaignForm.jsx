import React from 'react';

import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    Grid,
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Reciepents from './Reciepents';
import { basePath } from '../../constants/ApiPaths';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { IoMdClose } from "react-icons/io";
import Spinner from '../../custom/Spinner';


const CreateCampaignForm = ({ open, handleClose, refresh }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        areas: [],
        pincodes: [],
        specialization: [],
        age: [],
        templateId: ''
    });
    const [patientsByArea, setPatientsByArea] = useState([])
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false)

    const { loginInfo } = useAuth()

    useEffect(() => {

    }, [])

    useEffect(() => {
        getPatientByArea()
    }, [formData.areas])

    const getPatientByArea = async () => {

        try {
            const areas = formData.areas.map((area) => area.value)
            const response = await axios.post(`${basePath}/patient/by-area/`, {
                areas: areas
            })

            setPatientsByArea([...response.data])
        } catch (error) {
            console.error('error in fetching patients by area in campaign', error)
            if (error.response.data?.detail == 'No areas provided.') {
                setPatientsByArea([])
            }
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate required fields
        const requiredFields = ['name', 'description', 'templateId'];
        const errors = {};

        requiredFields.forEach(field => {
            if (!formData[field]) {
                errors[field] = 'This field is required';
            }
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const newAreas = formData.areas.map((area) => area.value)
        if (newAreas.length <= 0) {
            toast.error('please choose areas')
            return
        }

        try {
            setIsLoading(true)
            const payload = {
                name: formData.name,
                description: formData.description,
                areas: newAreas.join(','),
                patient_count: 10,
                template: formData.templateId,
                status: 'Active',
                created_by: loginInfo?.user?.user_id,
                scheduled_at: new Date()
            }
            const response = await axios.post(`${basePath}/core/campaigns/`, { ...payload });
            toast.success('campaign created successfully')
            handleClose()
            refresh()
        } catch (error) {
            console.error('error in creating campaign', error);
        } finally {
            setIsLoading(false)
        }

    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: "" })
        }
        setFormData({ ...formData, [name]: value });
    };

    const handlePinCodeChange = (pincodes) => {
        setFormData({ ...formData, pincodes: pincodes });
    }

    const handleAreaChange = (areas) => {
        setFormData({ ...formData, areas: areas });
    }

    const clearData = () => {
        const formData = {
            name: '',
            description: '',
            areas: [],
            pincodes: [],
            specialization: [],
            age: [],
            templateId: ''
        }
        setFormData(formData)
        setFormErrors({})
    }

    const handleDialogClose = () => {
        handleClose()
        clearData()
    }

    return (
        <Dialog open={open} onClose={handleDialogClose}>
            {isLoading && <Spinner />}
            <DialogTitle>
                <div className='flex justify-between items-center'>
                    <span>Create Campaign</span>
                    <IoMdClose onClick={handleClose} className='cursor-pointer' />
                </div>
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Name"
                                fullWidth
                                type="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                fullWidth
                                type="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                error={!!formErrors.description}
                                helperText={formErrors.description}
                                required
                            />
                        </Grid>
                        <DialogTitle>Reciepents</DialogTitle>
                        <Reciepents
                            formData={formData}
                            handleChange={handleChange}
                            handlePinCodeChange={(pincodes) => handlePinCodeChange(pincodes)}
                            handleAreaChange={(areas) => handleAreaChange(areas)}
                            patientsByArea={patientsByArea}
                        />
                        <DialogTitle>Template Id</DialogTitle>
                        <Grid item xs={12}>
                            <TextField
                                label="TemplateId"
                                fullWidth
                                type="templateId"
                                name="templateId"
                                value={formData.templateId}
                                onChange={handleChange}
                                error={!!formErrors.templateId}
                                helperText={formErrors.templateId}
                                required
                            />

                        </Grid>
                    </Grid>
                    <DialogActions style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
                        <Button onClick={handleClose} color="secondary">Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" onClick={handleSubmit} disabled={patientsByArea?.length === 0}>Create</Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCampaignForm