import React from 'react';
import unauthorized from '../assets/unauthorized access.png'


const UnAuthorizedPage = () => {
    return (
        <div className='flex justify-center'>
            <img src={unauthorized} style={{ width: '70%' }} />
        </div>
    );
}

export default UnAuthorizedPage;
