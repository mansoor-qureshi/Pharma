import React from 'react'
import { useState, useEffect, useRef } from 'react'
import {
    Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import { IoClose } from "react-icons/io5";

import { toast } from 'react-toastify';
const Signature = ({ openSignatureDialog, setOpenSignatureDialog, setSignatureImage }) => {
    const signatureRef = useRef();

    // useEffect(() => {
    //     return () => {
    //         if (signatureRef) {
    //             clearSignature()
    //         }
    //     }
    // })

    const clearSignature = () => {
        signatureRef.current.clear();
    };

    const handleUpload = () => {
        const dataUrl = signatureRef.current.toDataURL();
        const drawn = signatureRef.current.toData()

        if (!drawn[0]) {
            toast.error('please sign to upload')
            return
        }
        setSignatureImage(dataUrl)
        setOpenSignatureDialog(false)
    }

    return (
        <Dialog open={openSignatureDialog} onClose={() => setOpenSignatureDialog(false)}>
            <DialogTitle>
                <div className='flex justify-between'>
                    <span>Signature</span>
                    <IoClose
                        size={24}
                        className='cursor-pointer'
                        onClick={() => setOpenSignatureDialog(false)}
                    />
                </div>
            </DialogTitle>
            <DialogContent>
                <div className='flex flex-col gap-5'>
                    <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{ width: 500, height: 200, className: 'border rounded-md' }}
                    />
                    <div className='flex justify-end gap-5'>
                        <button
                            onClick={clearSignature}
                            className='p-2 bg-gray-300 rounded-md w-20'
                        >
                            Clear</button>
                        <button
                            onClick={handleUpload}
                            className='p-2 bg-blue-300 rounded-md w-20'
                        >
                            upload</button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default Signature