import * as React from 'react';
import { Paper, Container, Grid, Divider, Button, IconButton } from '@mui/material';
import { Send, Groups2, Info } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import ChatMessages from './ChatMessages';
import ChatInfo from './ChatInfo';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import Gallery from '@mui/icons-material/Image';
import ImageView from './ImageView';
import CircularProgress from '@mui/material/CircularProgress';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const ChatComponent = ({ socket, info, manageMembership, uploadChatImage }) => {
    const navigate = useNavigate();
    const [type, setType] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [right, setRight] = useState(-1);
    const [sendClicked, setSendClicked] = useState(false);
    const [empty, setEmpty] = useState(null);
    const [loadMoreVisibility, setLoadMoreVisibility] = useState(false);
    const fileInputRef = React.useRef(null);
    const [sendDisabled, setSendDisabled] = useState(false);
    //
    const [image, setImage] = useState(null);
    const [uploadImage, setUploadImage] = useState(null);
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setUploadImage(file);
            event.target.value = '';
        }
        else
            alert('Please select an image file.');
    };
    useEffect(() => {
        const fetch = async () => {
            await joinRoom();
            await getMessages();
        }
        fetch();
        const handleReceivedMessage = obj => {
            setMessages(prev => [...prev, { message: obj.message, username: obj.user.username, imageId: obj.imageId, unique: obj.unique }]);
        };

        const handleGettingUsers = obj => {
            setUsers(obj);
        };

        const handleUpdatedUserStatus = (username) => {
            console.log(`${username} was removed !`);
        }

        const handleTriggeredRefresh = () => {
            window.location.reload();
        }

        const handleGettingMessages = mess => {
            if (mess.length === 0) {
                setLoadMoreVisibility(false);
                setEmpty(true);
            } else {
                setEmpty(false);
                setMessages((prev) => {
                    let new_arr = prev === null ? [] : prev;
                    for (let i = mess.length - 1; i >= 0; i--) {
                        if (!new_arr.some(x => x.unique === mess[i].unique))
                            new_arr.unshift(mess[i]);
                    }
                    return new_arr;
                });
                setRight(prev => prev - 6);
            };
        }

        const handleReceivedImage = (data) => {
            setImage(data);
            setOpenImage(true);
        }

        const handleReceivedUnique = (obj) => {
            setMessages(prev => [...prev, { message: obj.message, username: obj.user.username, imageId: obj.imageId, unique: obj.unique }]);
            setRight(prev => prev - 1);
            document.getElementById('message').value = '';
            setSendClicked(true);
            setUploadImage(null);
            setSendDisabled(false);
        }

        socket.on('received_message', handleReceivedMessage);
        socket.on('getting_users', handleGettingUsers);
        socket.on('getting_messages', handleGettingMessages);
        socket.on('heart_beat', handleHeartBeat);
        socket.on('updated_user_status', handleUpdatedUserStatus);
        socket.on('triggered_refresh', handleTriggeredRefresh)
        socket.on('received_image', handleReceivedImage);
        socket.on('received_unique', handleReceivedUnique);

        return () => {
            socket.off('received_message', handleReceivedMessage);
            socket.off('getting_users', handleGettingUsers);
            socket.off('getting_messages', handleGettingMessages);
            socket.off('heart_beat', handleHeartBeat);
            socket.off('updated_user_status', handleUpdatedUserStatus);
            socket.off('received_image', handleReceivedImage);
            socket.off('received_unique', handleReceivedImage);
        };
    }, []);

    async function updateUserStatus(data) {
        await socket.emit('update_user_status', data);
    }

    async function getMessages() {
        await socket.emit('get_messages', { room: info.room, right });
    }

    async function getUsers() {
        await socket.emit('get_users', info.room);
        setType(true);
        setOpen(true);
    }

    async function getInfo() {
        setType(false);
        setOpen(true);
    }

    async function handleHeartBeat() {
        const { username, room } = info;
        await socket.emit('heart_beat_received', { username, room });
        await socket.emit('get_users', room);
    }

    async function joinRoom() {
        const { username, room } = info;
        if (socket)
            socket.emit('join_room', { username, room });
    };

    async function onSend() {
        setSendDisabled(true);
        let imageId = null;
        if (uploadImage !== null)
            imageId = await uploadChatImage(uploadImage)
        const message = document.getElementById('message').value;
        if ((message.trim().length !== 0 || uploadImage !== null) && imageId !== 0)
            await socket.emit('send_message', { user: { username: info.username, room: info.room }, message, imageId: imageId === null ? 'none' : imageId });
        setSendDisabled(false);

    }

    async function onImageViewClick(unique) {
        socket.emit('get_image', unique);
    }

    return (
        <Container sx={{ height: '83vh', display: 'flex', flexDirection: 'column', borderRadius: '20px' }}>
            <ImageView image={image} openImage={openImage} setOpenImage={setOpenImage} />
            <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <ChatInfo manageMembership={manageMembership} info={info} updateUserStatus={updateUserStatus} open={open} setOpen={setOpen} users={users} navigate={navigate} type={type} />
                <Grid container justifyContent={'flex-end'}>
                    <Grid item>
                        <IconButton onClick={getUsers}>
                            <Groups2 style={{ color: '#1E90FF' }} />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton onClick={getInfo}>
                            <Info style={{ color: '#9370DB' }} />
                        </IconButton>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container justifyContent={'center'} sx={{ flex: 1 }}>
                    {loadMoreVisibility && (
                        <Button onClick={async () => await getMessages()}>Load more</Button>
                    )}
                    <Grid item xs={12} sx={{ overflowY: 'auto' }}>
                        <ChatMessages you={info.username} onImageViewClick={onImageViewClick} empty={empty} setLoadMoreVisibility={setLoadMoreVisibility} messages={messages} navigate={navigate} sendClicked={sendClicked} setSendClicked={setSendClicked} />
                    </Grid>
                    {uploadImage !== null && (
                        <AddPhotoAlternateIcon onClick={() => { setImage(uploadImage); setOpenImage(true) }} />
                    )}
                </Grid>
                <Grid container justifyContent="flex-end" sx={{ padding: 2 }}>
                    <Grid item xs>
                        <TextField
                            fullWidth
                            id='message'
                            multiline
                            variant="outlined"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSend() } }}
                            placeholder="Type a message"
                        />
                    </Grid>
                    <Grid item>
                        <IconButton sx={{ height: '3.5rem', color: 'cadetblue' }} aria-label="" onClick={() => { fileInputRef.current.click(); }}>
                            <Gallery fontSize='medium' />
                            <input
                                id='imageInput'
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton disabled={sendDisabled} sx={{ height: '3.5rem' }} aria-label="" onClick={onSend}>
                            <Send fontSize='medium' />
                            {sendDisabled && (
                                <CircularProgress
                                    size={20}
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px',
                                    }}
                                />
                            )}
                        </IconButton>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default ChatComponent;
