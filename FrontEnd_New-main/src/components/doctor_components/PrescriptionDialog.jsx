// import React, { useEffect, useState, useRef, useCallback } from "react";
// import {
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import axios from "axios";
// import { basePath } from "../../constants/ApiPaths";

// const apiKey = "AIzaSyDXSgkTq7ZFy5aswsyzYrLY1dD1-fQ1oMs";

// const PrescriptionDialog = (props) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcription, setTranscription] = useState("");
//   const [mediaRecorder, setMediaRecorder] = useState(null);

//   // Cleanup function to stop recording and release media resources
//   useEffect(() => {
//     return () => {
//       if (mediaRecorder) {
//         mediaRecorder.stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [mediaRecorder]);

//   const audioBlobToBase64 = (blob) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const arrayBuffer = reader.result;
//         const base64Audio = btoa(
//           new Uint8Array(arrayBuffer).reduce(
//             (data, byte) => data + String.fromCharCode(byte),
//             ''
//           )
//         );
//         resolve(base64Audio);
//       };
//       reader.onerror = reject;
//       reader.readAsArrayBuffer(blob);
//     });
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       recorder.start();
//       console.log('Recording started');

//       recorder.addEventListener('dataavailable', async (event) => {
//         console.log('Data available event triggered');
//         const audioBlob = event.data;
//         const base64Audio = await audioBlobToBase64(audioBlob);

//         try {
//           const response = await axios.post(
//             `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
//             {
//               config: {
//                 encoding: 'WEBM_OPUS',
//                 sampleRateHertz: 48000,
//                 languageCode: 'en-US',
//               },
//               audio: {
//                 content: base64Audio,
//               },
//             }
//           );

//           const endTime = performance.now();
//           const elapsedTime = endTime - startTime;

//           //console.log('API response:', response);
//           console.log('Time taken (ms):', elapsedTime);

//           if (response.data.results && response.data.results.length > 0) {
//             setTranscription(response.data.results[0].alternatives[0].transcript);
//           } else {
//             console.log('No transcription results in the API response:', response.data);
//             setTranscription('No transcription available');
//           }
//         } catch (error) {
//           console.error('Error with Google Speech-to-Text API:', error.response.data);
//         }
//       });

//       setMediaRecorder(recorder);
//       setIsRecording(true);
//     } catch (error) {
//       console.error('Error getting user media:', error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder) {
//       mediaRecorder.stop();
//       console.log('Recording stopped');
//       setIsRecording(false);
//     }
//   };

//   const handleMicButtonClick = () => {
//     if (!isRecording) {
//       startRecording();
//     } else {
//       stopRecording();
//     }
//   };

//   const viewPrescription = (e) => {
//     e.preventDefault();
//     props.setOpenPrescription(false);
//     props.setViewPrescription(true);
//     props.sendTranscription(transcription);
//   };

//   return (
//     <div>
//       <Dialog
//         fullWidth
//         open={props.openPrescription}
//         onClose={() => props.setOpenPrescription(false)}
//       >
//         <DialogTitle>
//           <div className="flex justify-between items-center mt-3">
//             <span className="font-bold">Clinical Notes</span>
//             <button
//               className={`text-white px-4 rounded ${
//                 !isRecording ? "bg-blue-500 hover:bg-blue-700" : "bg-red-500"
//               }`}
//               onClick={handleMicButtonClick}
//             >
//               {!isRecording ? "Record" : "Stop"}
//             </button>
//           </div>
//         </DialogTitle>
//         <DialogContent className="mt-3 mb-3">
//           <TextField
//             multiline
//             fullWidth
//             value={transcription?.trim() || ""}
//             rows={10}
//           />
//         </DialogContent>
//         <DialogActions className="mb-3">
//           <button
//             className="text-white py-2 px-4 rounded bg-blue-500 hover:bg-blue-700"
//             onClick={viewPrescription}
//             disabled={isRecording || transcription === ""}
//           >
//             View Prescription
//           </button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default PrescriptionDialog;
