import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, useMediaQuery, Box, Paper } from '@mui/material';
import { authAC, wallAC } from '../../../redux/features/';
import { connect } from 'react-redux';
import TagsList from './TagsList';
import Snack from "../Layout/SnackBar/Snack";
import Progress from '../Layout/ProgressBar';

const NewPost = ({ addPost, errors, user, getUser, change }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [title, setTitle] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetch = async () => {
            const res = await getUser();
            if (res === 1) setLoading(false);
        };
        fetch();
    }, [change]);

    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const handleCreatePost = async () => {
        setButtonDisabled(true);
        const res = await addPost({ title, description, tags });
        if (res === 1) {
            setAlertMessage('Post created successfully!');
            setOpen(true);
            setTimeout(() => {
                navigate(`/wall/${user.username}/posts`);
            }, 500);
        } else {
            setAlertMessage('Error creating post.');
            setButtonDisabled(false);
            setOpen(true);
        }
    };

    return (
        <>
            {!loading ? (
                <>
                    <Snack alertMessage={alertMessage} open={open} setOpen={setOpen} errors={errors} />
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        mx="auto"
                        mt="2.4rem"
                        width="100%"
                        maxWidth="48rem"
                    >
                        <Paper elevation={3} sx={{ width: '90%', p: 3.6, borderRadius: '0.9rem' }}>
                            <Typography variant="h5" gutterBottom>
                                Add a New Post
                            </Typography>
                            <TextField
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                sx={{ width: '100%', marginBottom: '1.8rem' }}
                                size="medium"
                                id="title"
                                label="Title"
                                multiline
                                maxRows={3}
                                variant="outlined"
                                required
                            />
                            <TextField
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                sx={{ width: '100%', marginBottom: '1.8rem' }}
                                size="medium"
                                id="description"
                                label="Description"
                                multiline
                                maxRows={7}
                                variant="outlined"
                                required
                            />
                            <TagsList tags={tags} setTags={setTags} />
                            <Button
                                disabled={buttonDisabled}
                                variant="contained"
                                color="primary"
                                onClick={handleCreatePost}
                                sx={{ mt: 2.4 }}
                            >
                                Create
                            </Button>
                        </Paper>
                    </Box>
                </>
            ) : (
                <Progress />
            )}
        </>
    );
};

const stateProps = (state) => {
    return {
        errors: state.wall.errors,
        user: state.auth.user
    };
};

const actionCreators = (dispatch) => {
    return {
        addPost: (data) => {
            return wallAC.AddPost(dispatch, data);
        },
        getUser: () => {
            return authAC.GetUser(dispatch);
        }
    };
};

export default connect(stateProps, actionCreators)(NewPost);
