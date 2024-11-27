import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { isValidPhoneNumber } from 'libphonenumber-js';
import { useState } from 'react'
import './PhoneInput.css'

const PhoneNumberBox = ({ value, handlePhoneNumberChange, errorMsg }) => {

    return (
        <div className='flex flex-col'>
            <div className="phone-input" style={{ border: errorMsg ? '1px solid #DC2626' : '1px solid gray' }}>
                <PhoneInput
                    placeholder="Enter phone number"
                    value={value}
                    onChange={handlePhoneNumberChange}
                    international
                    defaultCountry="IN"
                    required
                />
            </div>
            {errorMsg &&
                <div className="text-red-600 text-[14px] ml-4">
                    {errorMsg}
                </div>
            }
        </div >
    )
}

export default PhoneNumberBox