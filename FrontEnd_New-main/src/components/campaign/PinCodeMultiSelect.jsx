import React, { useState, useEffect, useMemo } from 'react';
import Select, { components } from 'react-select';
import { FixedSizeList as List } from 'react-window';
import usePincodes from '../../hooks/usePincodes';

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



const PinCodeMultiSelect = ({ value, handlePinCodeChangeInRecipent }) => {

    const [inputValue, setInputValue] = useState('');
    const [allOptions, setAllOptions] = useState([])
    const [options, setOptions] = useState([])
    const { isLoading, pinCodes } = usePincodes()

    useEffect(() => {
        if (pinCodes) {
            const codes = pinCodes.map((pincode) => {
                return { value: pincode, label: pincode }
            })
            setOptions([...codes])
            setAllOptions([...codes])
        }

    }, [pinCodes])

    const handleInputChange = (newValue) => {
        setInputValue(newValue);
        const filteredOptions = allOptions.filter(option =>
            option.label.startsWith(newValue)
        );
        setOptions(filteredOptions);
    };

    const handleChange = (option) => {
        if (option === null) {
            setInputValue('');
            setOptions(allOptions);
            return
        }
        handlePinCodeChangeInRecipent(option)
    };

    return (
        <Select
            isMulti
            options={options}
            styles={customStyles}
            isLoading={isLoading}
            components={{ MenuList }}
            onInputChange={handleInputChange}
            inputValue={inputValue}
            onChange={handleChange}
            value={value}
            isClearable
            placeholder="PinCode"

        />
    );
};

export default PinCodeMultiSelect;
