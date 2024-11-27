import React, { useEffect, useState } from 'react';
import { Checkbox, TextField, Button, FormControlLabel, Grid } from '@mui/material';
// import { doctorAvailability } from '../constants/DoctorConstant';

const DoctorAvailability = ({ onAvailabilityChange, doctorAvailability }) => {

    const [availability, setAvailability] = useState({});

    useEffect(() => {
        setAvailability({ ...doctorAvailability })
    }, [doctorAvailability])

    console.log('subcomponent availability', availability)

    const handleChange = (event) => {
        const { name, checked } = event.target;
        setAvailability(prevState => ({
            ...prevState,
            [name]: { checked: checked, startTime: '', endTime: '' }
        }));
        onAvailabilityChange({ ...availability, [name]: { ...availability[name], checked: checked } });

    };

    const handleStartTimeChange = (event) => {
        const { name, value } = event.target;
        setAvailability(prevState => ({
            ...prevState,
            [name]: { ...prevState[name], startTime: value }
        }));
        onAvailabilityChange({ ...availability, [name]: { ...availability[name], startTime: value } });

    };

    const handleEndTimeChange = (event) => {
        const { name, value } = event.target;
        setAvailability(prevState => ({
            ...prevState,
            [name]: { ...prevState[name], endTime: value }
        }));
        onAvailabilityChange({ ...availability, [name]: { ...availability[name], endTime: value } });
    };

    return (

        <Grid container spacing={2}>
            <Grid item xs={12} key='heading'>
                <div className='flex justify-between items-end'>
                    <span className='font-bold'>Day</span>
                    <span className='font-bold'>From</span>
                    <span className='font-bold'>To</span>
                </div>
            </Grid>
            {Object.keys(availability).map((day, index) => (
                <Grid item xs={12} key={index}>
                    <div className='flex justify-between items-center'>
                        <FormControlLabel
                            control={
                                <Checkbox checked={availability[day].checked} onChange={handleChange} name={day} />
                            }
                            label={day}
                        />
                        <TextField
                            id={`${day}StartTime`}
                            name={day}
                            type="time"
                            label=""
                            value={availability[day].startTime}
                            onChange={handleStartTimeChange}
                            inputProps={{
                                step: 300,
                                inputMode: 'numeric',
                                pattern: '[0-9]{2}:[0-9]{2}',
                            }}
                            disabled={!availability[day].checked}
                        />
                        <TextField
                            id={`${day}EndTime`}
                            name={day}
                            type="time"
                            label=""
                            value={availability[day].endTime}
                            onChange={handleEndTimeChange}
                            inputProps={{
                                step: 300,
                                inputMode: 'numeric',
                                pattern: '[0-9]{2}:[0-9]{2}',
                            }}
                            disabled={!availability[day].checked}
                        />
                    </div>
                </Grid>
            ))}
        </Grid>
    );
}

export default DoctorAvailability;
