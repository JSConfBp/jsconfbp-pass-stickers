import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export default function Index() {

  const [ errorMessage, setErrorMessage ] = useState('');
  const [ showAlert, setShowAlert ] = useState(false);
  const [ showSuccess, setShowSuccess ] = useState(false);

  const [ firstname, setFirstName ] = useState('');
  const [ lastname, setLastnameName ] = useState('');
  const [ twitterhandle, setTwitterHandle ] = useState('');

  const [ working, setWorking ] = useState(false);
  const handleFinish = () => {
    setWorking(false);
  };
  const handleStart = () => {
    setWorking(!working);

    fetch('/api/print', {
      method: 'POST',
      body: JSON.stringify({
        firstname: firstname.toUpperCase(),
        lastname,
        twitterhandle
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorMessage('Could not print!')
          if (data.error.stderr) {
            setErrorMessage(data.error.stderr)
          }
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 5000)
        } else {
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 2000)
        }
        //setData(data)
        handleFinish()
      })
  };


  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          JSConf Budapest 2022
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Pass sticker maker
        </Typography>

        <Stack sx={{ width: '100%' }} spacing={2}>
          <TextField 
            id="sticker-firstname" 
            label="First name" 
            variant="outlined" 
            onChange={event => setFirstName(event.target.value)}
            value={firstname}
          />
          <TextField 
            id="sticker-lastname" 
            label="Last name" 
            variant="outlined" 
            onChange={event => setLastnameName(event.target.value)}
            value={lastname}
          />
          <TextField 
            id="sticker-twitter" 
            label="Twitter handle" 
            variant="outlined" 
            onChange={event => setTwitterHandle(event.target.value)}
            value={twitterhandle}
          />
          <Button variant="contained" onClick={handleStart}>Print</Button>
        </Stack>
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={working}
        onClick={handleFinish}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      { showAlert && (
      <Alert severity="error" variant="filled">
        <AlertTitle>Error</AlertTitle>
        {errorMessage}
      </Alert>)}
      { showSuccess && (
      <Alert severity="success" variant="filled">
        <AlertTitle>Success!</AlertTitle>
        Print completed
      </Alert>)}
    </Container>
  );
}