import React, { useEffect, useState } from 'react';
import { Button, Modal, TextField, Grid } from '@mui/material'
const ConfirmationModal = ({ setResetGranted, userid, verifiyMailId, setConfirmationModal, confirmationModal, setMailGranted }) => {
    const [input, setInput] = useState('');
    const handleSubmit = async () => {
        if (input.trim().length > 0) {
            const result = await verifiyMailId({ userid, input });
            if (result === 1)
                setMailGranted(true);
            else
                setMailGranted(false);
            handleClose();
        } else alert('You need to enter something !');
    };

    const handleClose = () => {
        setInput('');
        document.getElementById('input').value = '';
        setConfirmationModal(false);

    }
    return (
        <div>
            <Modal open={confirmationModal}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, backgroundColor: localStorage.getItem('mode') === 'dark' ? 'black' : 'white', padding: 20 }}>
                    <h4 style={{ textAlign: 'center' }}>Enter the confirmation code you received on the email you provided</h4>
                    <TextField
                        id='input'
                        label="Enter the code"
                        fullWidth
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={8}>
                            <Button fullWidth variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: 10 }}>
                                Submit
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="contained" color="error" onClick={() => { handleClose(); setResetGranted(null) }} style={{ marginTop: 10 }}>
                                Close
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </Modal>
        </div>
    );
};

export default ConfirmationModal;
