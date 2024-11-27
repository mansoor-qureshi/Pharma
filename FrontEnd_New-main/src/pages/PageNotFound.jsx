import React from 'react';
import notFound from '../assets/page-not-found.png'


const PageNotFound = () => {
    return (
        <div className='flex justify-center'>
            <img src={notFound} style={{ width: '60%' }} />
        </div>


    );
}

export default PageNotFound;
