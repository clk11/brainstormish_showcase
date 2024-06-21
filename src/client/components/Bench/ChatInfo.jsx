import React, { useState } from 'react'
import { Typography, Modal, List, ListItem, Grid, Box, Button } from '@mui/material';
import Chip from '@mui/material/Chip';

const commonStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    overflow: 'auto',
};

const style1 = {
    ...commonStyle,
    padding: 5,
    width: '21.875rem',
    height: '15.625rem',
};

const style2 = {
    ...commonStyle,
    width: '21.875rem',
    height: 'auto',
    padding: 2.5,
    maxHeight: '25rem',
    overflowY: 'auto',
    wordWrap: 'break-word',
};

const ChatInfo = ({ info, users, open, setOpen, navigate, type, updateUserStatus, manageMembership }) => {
    const [disabled, setDisabled] = useState(false);
    function formatName(str) {
        if (str.length > 10)
            return str.slice(0, 10) + '...';
        return str;
    }

    async function updateStatus(e, status) {
        setDisabled(true);
        let username = e !== null ? e.target.id : info.username;
        if (e !== null)
            await manageMembership({ username, room: info.room, action: status === -1 ? "ban" : "unban" });
        else
            await manageMembership({ room: info.room });
        await updateUserStatus({ username, room: info.room, status });
        setDisabled(false);
    }
    return (
        <>
            <Modal
                open={open}
                onClose={() => { setOpen(false) }}
            >
                {type ? (
                    <>
                        <Box sx={style1}>
                            <Typography variant="h6" component="h2">
                                Chat participants
                            </Typography>
                            <List sx={{ height: 'auto', overflow: 'auto' }}>
                                {users.map(({ username, status }) => (
                                    <ListItem key={username} divider>
                                        <Grid container spacing={2}>
                                            <Grid item xs={info.username === info.admin ? 4 : 9}>
                                                <Chip style={username === info.admin ? { backgroundColor: 'gold', color: 'black' } : { color: 'inherit' }} onClick={() => navigate(info.username === username ? '/' : `/wall/profile/${username}`)} label={formatName(username)} />
                                            </Grid>
                                            <Grid item xs={info.username === info.admin ? 4 : 3}>
                                                {status == 1 ? (
                                                    <Typography color={'#00e676'}>online</Typography>
                                                ) : (
                                                    <Typography color={'red'}>{(status == -1 && username !== info.admin) ? 'banned' : 'offline'}</Typography>
                                                )}
                                            </Grid>
                                            {(info.username === info.admin && username !== info.username) && (
                                                <Grid item xs={4}>
                                                    <Button disabled={disabled} id={username} onClick={async (e) => { await updateStatus(e, status != -1 ? -1 : 1) }} color="error" sx={{ height: '1.7rem' }}>
                                                        {status == -1 ? 'unban' : 'ban'}
                                                    </Button>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </>
                ) : (
                    <Box sx={style2}>
                        <h3>Title</h3>
                        <p>{info.title}</p>
                        <h3>Description</h3>
                        <p>
                            {info.description}
                        </p>
                        {!(info.admin === info.username) && (
                            <Button disabled={disabled} variant='outlined' onClick={async () => { await updateStatus(null, 0) }} color="error" sx={{ height: '1.7rem' }}>
                                LEAVE
                            </Button>
                        )}
                    </Box>
                )}
            </Modal>
        </>
    )
}

export default ChatInfo
