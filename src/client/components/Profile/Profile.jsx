import { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button';
import ProgressBar from '../Layout/ProgressBar';
import { Grid, Typography, Tooltip, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { authAC, wallAC } from '../../../redux/features/';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';

const Profile = ({ getUser, user, changeProfilePic }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const theme = useTheme();
	const [loading, setLoading] = useState(true);
	const [my, setMy] = useState(true);
	const fileInputRef = useRef(null);
	const [selectedImage, setSelectedImage] = useState(null);

	const handleUploadClick = () => {
		fileInputRef.current.click();
	};
	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		if (file && file.type.startsWith('image/')) {
			const confirmed = window.confirm('Are you sure you want to upload this image?');
			if (confirmed) {
				setSelectedImage(URL.createObjectURL(file));
				await changeProfilePic(file);
			}
		} else
			alert('Please select an image file.');
	};

	useEffect(() => {
		let isMounted = true;
		const fetchData = async () => {
			let result;
			if (window.location.href === import.meta.env.VITE_FN_URL) {
				result = await getUser(null);
				setMy(true);
			} else {
				result = await getUser(window.location.pathname.split('/')[3]);
				setMy(false);
			}
			if (result === 1 && isMounted) setLoading(false);
		};

		fetchData();

		return () => {
			isMounted = false;
		};
	}, [location.pathname]);

	return (
		<div style={{ fontSize: '1.3rem' }}>
			{loading && <ProgressBar />}
			{!loading && (
				<div>
					<Grid
						container
						spacing={2}
						direction='column'
						justifyContent='center'
						alignItems='center'
					>
						<Grid item sx={{ textAlign: 'center', position: 'relative' }}>
							{my && (
								<Tooltip title="Click to change your profile picture">
									<div onClick={handleUploadClick} style={{ cursor: 'pointer', position: 'relative' }}>
										<Avatar
											src={selectedImage === null ? user.image : selectedImage}
											sx={{
												width: '19rem',
												height: '19rem',
												margin: 2,
												transition: 'opacity 0.3s',
												'&:hover': {
													opacity: 0.7,
												}
											}}
										/>
										<EditIcon
											style={{
												position: 'absolute',
												bottom: '10%',
												right: '10%',
												backgroundColor: theme.palette.background.default,
												color: theme.palette.text.primary,
												borderRadius: '50%',
												padding: '0.3rem',
											}}
										/>
									</div>
								</Tooltip>
							)}
							{!my && (
								<Avatar
									src={selectedImage === null ? user.image : selectedImage}
									sx={{
										width: '19rem',
										height: '19rem',
										margin: 2,
									}}
								/>
							)}
							<input
								type="file"
								accept="image/*"
								style={{ display: 'none' }}
								ref={fileInputRef}
								onChange={handleFileChange}
							/>
							<Typography variant="h4" sx={{ fontSize: '2.5rem', margin: '1rem', marginTop: 0 }}>
								{user.username}
							</Typography>
							{user.email !== 'private' && (
								<Typography variant="subtitle1" sx={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>
									{user.email}
								</Typography>
							)}
							<Typography variant="subtitle2" sx={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>
								I became cool on {user.date}
							</Typography>
						</Grid>
						<Grid item container justifyContent='center' spacing={2}>
							<Grid item>
								{!my && (
									<Grid container spacing={1.5}>
										<Grid item>
											<Button
												onClick={() => navigate(`/wall/${user.username}/posts`)}
												variant='contained'
												color='primary'
											>
												{'created posts'}
											</Button>
										</Grid>
										<Grid item>
											<Button
												onClick={() => navigate(`/wall/${user.username}/posts/joined`)}
												variant='contained'
												color='secondary'
											>
												{'joined posts'}
											</Button>
										</Grid>
									</Grid>
								)}
							</Grid>
						</Grid>
					</Grid>
				</div>
			)}
		</div>
	);
};

const stateProps = (state) => {
	if (window.location.href === import.meta.env.VITE_FN_URL) {
		return {
			user: state.auth.user,
		};
	} else {
		return {
			user: state.wall.user,
		};
	}
};

const actionCreators = (dispatch) => {
	return {
		getUser: (data) => {
			if (data === null) return authAC.GetUser(dispatch);
			else return wallAC.GetUser(dispatch, data);
		},
		changeProfilePic: (data) => {
			return authAC.ChangeProfilePic(dispatch, data);
		}
	};
};

export default connect(stateProps, actionCreators)(Profile);
