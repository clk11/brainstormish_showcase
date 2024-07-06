import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import customAxios from '../../../../server/utils/customAxios.js';
import { Grid, IconButton, Button, useTheme, Avatar, Typography } from '@mui/material';
import AccountDropdownMenu from './AccountDropDown.jsx';

const MenuOptions = ({ setOpen, navigate, toggleMode, direction, user }) => {
    const theme = useTheme();

    const logout = async () => {
        await customAxios.get('/auth/clear_session');
        navigate('/');
        window.location.reload();
    };

    const toWall = () => {
        navigate('/wall');
        if (setOpen !== undefined)
            setOpen(false);
    };

    const toJoined = () => {
        navigate(`/wall/${user.username}/posts/joined`);
        if (setOpen !== undefined)
            setOpen(false);
    };

    const toCreated = () => {
        navigate(`/wall/${user.username}/posts`);
        if (setOpen !== undefined)
            setOpen(false);
    };

    const toCreate = () => {
        navigate('/createPost');
        if (setOpen !== undefined)
            setOpen(false);
    };

    const toProfile = () => {
        navigate('/');
        if (setOpen !== undefined)
            setOpen(false);
    };

    const buttonStyle = {
        color: theme.palette.text.primary,
        fontSize: direction === 'row' ? '1.1rem' : 'inherit',
    };

    return (
        <>
            <Grid
                container
                direction={direction}
                justifyContent={direction === 'column' ? 'row' : 'space-around'}
                alignItems="center"
                spacing={direction === "column" ? 2 : 3}
            >
                {direction === 'column' && (
                    <Grid item>
                        <Button onClick={toProfile} style={{ color: 'grey' }}>
                            <Avatar src={user.image} alt={user.username} sx={{ marginRight: '0.5rem' }} />
                            <Typography variant="h6">{user.username}</Typography>
                        </Button>
                    </Grid>
                )}
                <Grid item>
                    <Button onClick={toCreate} style={buttonStyle}>
                        create
                    </Button>
                </Grid>
                <Grid item>
                    <Button onClick={toWall} style={buttonStyle}>
                        not joined
                    </Button>
                </Grid>
                <Grid item>
                    <Button onClick={toJoined} style={buttonStyle}>
                        joined
                    </Button>
                </Grid>
                <Grid item>
                    <Button onClick={toCreated} style={buttonStyle}>
                        created
                    </Button>
                </Grid>

                {direction !== 'column' ? (
                    <Grid item>
                        <AccountDropdownMenu toggleMode={toggleMode} toProfile={toProfile} user={user} logout={logout} />
                    </Grid>
                ) : (
                    <Grid item>
                        <Button onClick={logout} style={buttonStyle}>
                            logout
                        </Button>
                    </Grid>
                )}
                {direction === 'column' && (
                    <Grid item>
                        <IconButton onClick={toggleMode} size="large">
                            {localStorage.getItem('mode') === 'light' ? (
                                <DarkModeIcon />
                            ) : (
                                <LightModeIcon />
                            )}
                        </IconButton>
                    </Grid>
                )}
            </Grid>
        </>
    );
};

export default MenuOptions;