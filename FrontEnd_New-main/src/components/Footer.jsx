import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

function Footer() {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        textAlign: 'center',
        padding: 2,
      }}
      elevation={3}
    >
      <Typography variant="body2" color="text.secondary">
        &copy; 2024 MediMind. All rights reserved.
      </Typography>
    </Paper>
  );
}

export default Footer;
