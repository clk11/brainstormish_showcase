import React, { useState } from 'react';
import { Button, Modal, TextField, Grid } from '@mui/material'

const ResetPasswordModal = ({ setNewPassword, setFinishReset, setResetEmail, changeUI, verifyEmail, setResetGranted, resetPasswordModal, setResetPasswordModal }) => {
    const [input, setInput] = useState('');
    const handleSubmit = async () => {
        if (!changeUI) {
            const result = await verifyEmail({ email: input });
            if (result === 1) {
                setResetEmail(input);
                setResetGranted(true);
            }
            else
                setResetGranted(false);
            handleClose();

        } else {
            setNewPassword(input);
            setResetPasswordModal(false);
            setFinishReset(true);
            handleClose();
        }
    };

    const handleClose = () => {
        setResetPasswordModal(false);
        setInput('');
        document.getElementById('input').value = '';
    }

    return (
        <div>
            <Modal open={resetPasswordModal}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, backgroundColor: localStorage.getItem('mode') === 'dark' ? 'black' : 'white', padding: 20 }}>
                    <h4 style={{ textAlign: 'center' }}>{!changeUI ? 'Enter the email address associated with the account whose password you want to reset' : 'Enter your new password'}</h4>
                    <TextField
                        id='input'
                        label={!changeUI ? 'Email' : 'New password'}
                        fullWidth
                        type={changeUI ? 'password' : 'email'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={8}>
                            <Button fullWidth variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: 10 }}>
                                {!changeUI ? 'SEND CODE' : 'CONFIRM'}
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="contained" color="error" onClick={() => { handleClose(); setResetGranted(null); }} style={{ marginTop: 10 }}>
                                Close
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </Modal >
        </div >
    );
};

export default ResetPasswordModal;
