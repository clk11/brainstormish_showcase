import { useState, useEffect } from 'react';
import { styled, alpha, AppBar, Toolbar, Avatar, useMediaQuery, useTheme } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import CollapsedNavbar from './CollapsedNavbar';
import { useNavigate } from 'react-router-dom';
import MenuOptions from './MenuOptions';
import { connect } from 'react-redux';
import { authAC } from '../../../../redux/features/';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled('input')(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
        width: '20ch',
        '&:focus': {
            width: '30ch',
        },
    },
    backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.common.white, 0.15) : 'transparent',
    borderRadius: theme.shape.borderRadius,
    border: theme.palette.mode === 'light' ? `1px solid ${alpha(theme.palette.common.black, 0.23)}` : 'none',
}));

const Navbar = ({ toggleMode, setStart, setSearchInput, getUser, user }) => {
    const [loading, setLoading] = useState(true);
    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const theme = useTheme();
    const [input, setInput] = useState('');

    useEffect(() => {
        const fetch = async () => {
            const result = await getUser();
            if (result === 1) {
                setLoading(false);
            }
        };
        fetch();
    }, [getUser]);

    const onSearch = () => {
        if (input.trim().length !== 0) {
            if (!window.location.href.includes('/wall')) {
                navigate('/wall');
            }
            setSearchInput(input);
            setStart(true);
            setInput('');
        }
    }

    const appBarStyle = {
        marginBottom: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : 'dark',
        color: theme.palette.text.primary,
    };

    return (
        <AppBar sx={appBarStyle} position="static">
            {!loading && (
                <Toolbar>
                    <Avatar
                        src={'/icon.png'}
                        sx={{ width: '5rem', height: '5rem', margin: 'auto' }}
                    />
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            id='input'
                            value={input}
                            onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Search…"
                            sx={{ fontSize: '1.2rem' }}
                        />
                    </Search>
                    {isSmallScreen ? (
                        <CollapsedNavbar user={user} toggleMode={toggleMode} />
                    ) : (
                        <MenuOptions
                            user={user}
                            direction={'row'}
                            toggleMode={toggleMode}
                            navigate={navigate} />
                    )}
                </Toolbar>
            )}
        </AppBar>
    );
}

const stateProps = (state) => {
    return {
        user: state.auth.user,
    };
};

const actionCreators = (dispatch) => {
    return {
        getUser: () => {
            return authAC.GetUser(dispatch);
        },
    };
};

export default connect(stateProps, actionCreators)(Navbar);

