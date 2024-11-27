import React, { useEffect } from 'react';

import {
    TextField,
    Grid, MenuItem, Checkbox, ListItemText, Select, InputLabel
} from '@mui/material';
import PinCodeMultiSelect from './PinCodeMultiSelect';
import { useState } from 'react'
import axios from 'axios'
import { basePath } from '../../constants/ApiPaths'
import AreaComponent from './AreaComponent';


const Reciepents = ({ formData, handleChange, handlePinCodeChange, handleAreaChange, patientsByArea }) => {
    const [areas, setAreas] = useState([])


    const handleReciepentChange = (event) => {
        handleChange(event)
    }

    const handlePinCodeChangeInRecipent = async (zipCodes) => {

        handlePinCodeChange(zipCodes)

        const promises = zipCodes.map(async (zipCode) => {
            const result = await getAreasByPinCode(zipCode?.value)
            return result
        })

        const result = await Promise.allSettled(promises)
        const areas = []
        result.forEach(element => {
            if (element.value?.length > 0) {
                areas.push(...element.value)
            }
        });
        console.log(areas)
        setAreas([...areas])
    }

    const getAreasByPinCode = async (zipcode) => {
        try {
            console.log(zipcode)
            const response = await axios.get(`${basePath}/patient/check-pincode/${zipcode}`)
            console.log(response.data.areas)
            return response.data?.areas
        } catch (error) {
            console.error('error in fetching areas by pincode ', error)
        }
    }


    return <Grid item xs={12}>
        <Grid container spacing={2}>
            <Grid item xs={6}>
                {/* <TextField
                    select
                    label="Area"
                    fullWidth
                    name="area"
                    value={formData.area}
                    onChange={handleReciepentChange}
                    SelectProps={{
                        multiple: true,
                        renderValue: (selected) => selected.join(', '),
                    }}
                >
                    {['Area 1', 'Area 2', 'Area 3', 'Area 4'].map((option) => (
                        <MenuItem key={option} value={option}>
                            <Checkbox checked={formData.area.indexOf(option) > -1} />
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
                </TextField> */}
                <PinCodeMultiSelect
                    value={formData.pincodes}
                    handlePinCodeChangeInRecipent={handlePinCodeChangeInRecipent}
                />
            </Grid>
            <Grid item xs={6}>
                {/* <TextField
                    select
                    label="pincode"
                    fullWidth
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleReciepentChange}
                    SelectProps={{
                        multiple: true,
                        renderValue: (selected) => selected.join(', '),
                    }}
                >
                    {['Pincode 1', 'Pincode 2', 'Pincode 3', 'Pincode 4'].map((option) => (
                        <MenuItem key={option} value={option}>
                            <Checkbox checked={formData.pincode.indexOf(option) > -1} />
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
                </TextField> */}

                <AreaComponent
                    areas={areas}
                    value={formData.areas}
                    handleAreaChange={handleAreaChange}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    select
                    label="Specialization"
                    fullWidth
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleReciepentChange}
                    SelectProps={{
                        multiple: true,
                        renderValue: (selected) => selected.join(', '),
                    }}
                >
                    {['Specialization 1', 'Specialization 2', 'Specialization 3', 'Specialization 4'].map((option) => (
                        <MenuItem key={option} value={option}>
                            <Checkbox checked={formData.specialization.indexOf(option) > -1} />
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={6}>
                <TextField
                    select
                    label="age"
                    fullWidth
                    name="age"
                    value={formData.age}
                    onChange={handleReciepentChange}
                    SelectProps={{
                        multiple: true,
                        renderValue: (selected) => selected.join(', '),
                    }}
                >
                    {['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'].map((option) => (
                        <MenuItem key={option} value={option}>
                            <Checkbox checked={formData.age.indexOf(option) > -1} />
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={6}>
                Total Patients : {patientsByArea?.length}
            </Grid>
        </Grid>
    </Grid>
}

export default Reciepents