import React, { useState } from 'react';
import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';

const AccountDropdownMenu = ({ user, logout, toProfile, toggleMode }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="Account settings">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={anchorEl ? 'account-menu' : undefined}
                        aria-haspopup="true"
                    >
                        <Avatar src={user.image} alt={user.username}>
                            {user.username.charAt(0)}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
            >
                <MenuItem onClick={toProfile} sx={{ display: 'flex', justifyContent: 'center' }}>
                    profile
                </MenuItem>
                <MenuItem onClick={toggleMode} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton onClick={toggleMode} size="large">
                        {localStorage.getItem('mode') === 'light' ? (
                            <DarkModeIcon />
                        ) : (
                            <LightModeIcon />
                        )}
                    </IconButton>
                </MenuItem>
                <MenuItem onClick={logout} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    logout
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
};

export default AccountDropdownMenu;
