import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FixedSizeList as List } from 'react-window';
// import { Checkbox, MenuItem } from '@material-ui/core';
import { Checkbox, MenuItem, ListItemText } from '@mui/material';


const customStyles = {
    control: (provided) => ({
        ...provided,
        minHeight: '56px', // Adjust height as needed
        fontSize: '17px', // Adjust font size as needed
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'white', // Ensure the dropdown menu has a background color
        zIndex: 9999, // Ensure the dropdown menu appears above other elements
    }),
};

const MenuList = props => {
    const height = 35; // Height of each item in the list
    const { options, children, maxHeight } = props;

    return (
        <List
            height={Math.min(maxHeight, options.length * height)}
            itemCount={children.length}
            itemSize={height}
            width="100%"
        >
            {({ index, style }) => (
                <div style={{ ...style, backgroundColor: 'white' }}>
                    {children[index]}
                </div>
            )}
        </List>
    );
};


const AreaComponent = ({ areas, value, handleAreaChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [allOptions, setAllOptions] = useState([])
    const [options, setOptions] = useState([])

    useEffect(() => {

        if (areas) {
            const newAreas = areas.map((area) => {
                return { value: area, label: area }
            })
            setAllOptions([...newAreas])
            setOptions([...newAreas])
        }
    }, [areas])


    const handleInputChange = (newValue) => {
        setInputValue(newValue);
        const filteredOptions = allOptions.filter(option =>
            option.label.toLowerCase().startsWith(newValue.toLowerCase())
        );
        setOptions(filteredOptions);
    };

    const handleChange = (option) => {
        if (option === null) {
            setInputValue('');
            setOptions(allOptions);
            return
        }
        handleAreaChange(option)
    };


    return (

        <Select
            isMulti
            options={options}
            styles={customStyles}
            components={{ MenuList }}
            onInputChange={handleInputChange}
            inputValue={inputValue}
            onChange={handleChange}
            value={value}
            isClearable
            placeholder="Areas"
        // isDisabled={allOptions.length ? false : true}
        />
    );
};

export default AreaComponent;
