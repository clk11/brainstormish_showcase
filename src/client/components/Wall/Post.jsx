import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import { red } from '@mui/material/colors';
import { Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useTheme } from '@mui/material/styles';

const style = (theme) => ({
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: 'background.paper',
	boxShadow: 24,
	p: 4,
	borderRadius: '30px',
	border: `0.5px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : theme.palette.grey[400]}`,
	width: '21.875rem',
	height: 'auto',
	padding: 2.5,
	maxHeight: '25rem',
	overflowY: 'auto',
	wordWrap: 'break-word',
});

const Post = ({ you, post, join, navigate }) => {
	const [loading, setLoading] = React.useState(true);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [open, setOpen] = React.useState(false);
	const theme = useTheme();

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const { id, title, description, date, username, tags, image } = post;

	const displayTag = (tag, key) => (
		<Grid item key={key}>
			<Chip variant='outlined' color='primary' label={tag} />
		</Grid>
	);

	React.useEffect(() => {
		if (you)
			setLoading(false);
	}, [you])

	const seeProfile = () => {
		navigate(you.username === username ? '/' : `/wall/profile/${username}`);
	};

	const handlePopoverOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const onJoin = async () => {
		if (post.status === 'not joined')
			await join({ admin_username: username, id_post: id, path: `/bench/${id}` }, navigate);
		else
			navigate(`/bench/${id}`);
	};

	const formatTitle = (str) => {
		if (str.length > 38)
			return str.slice(0, 30) + '...';
		return str;
	};

	return (
		<>
			{!loading && (
				<Card sx={{ maxWidth: 470, borderRadius: '20px', border: `0.5px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : theme.palette.grey[400]}` }}>
					<Grid container>
						<CardHeader
							avatar={
								<Avatar
									onMouseEnter={handlePopoverOpen}
									onMouseLeave={handlePopoverClose}
									onClick={seeProfile}
									src={image}
									sx={{ bgcolor: red[500], cursor: 'pointer' }}
									aria-label='recipe'
								>
									{username.substr(0, 3).toUpperCase()}
								</Avatar>
							}
							title={formatTitle(title)}
							subheader={date}
						/>
						<Popover
							sx={{
								pointerEvents: 'none',
							}}
							open={anchorEl === null ? false : true}
							anchorEl={anchorEl}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							onClose={handlePopoverClose}
							disableRestoreFocus
						>
							<Typography sx={{ p: 1 }}>Show the profile</Typography>
						</Popover>
						<Grid container sx={{ p: 2 }} spacing={2}>
							<Grid item container spacing={0.7}>
								{tags.map((tag, key) => displayTag(tag, key))}
							</Grid>
							<Grid item container alignItems="center">
								<Grid item>
									<Button disabled={post.status === "banned"} onClick={onJoin} variant='contained' color='success'>
										{post.status === 'joined' || post.status === 'owner' ? 'View' : (post.status === 'not joined' ? 'Join' : 'Banned')}
									</Button>
								</Grid>
								<Grid item container justifyContent="flex-end" xs spacing={1.5}>
									<Grid item>
										<IconButton onClick={handleOpen} aria-label='Show the picture' size="large">
											<DescriptionIcon fontSize={'small'} />
										</IconButton>
										<Modal
											open={open}
											onClose={handleClose}
											aria-labelledby='modal-modal-title'
											aria-describedby='modal-modal-description'
										>
											<Box sx={style(theme)}>
												<label>Title</label>
												<Typography
													sx={{ mt: 0.5 }}
													id='modal-modal-title'
												>
													{title}
												</Typography>
												<br />
												<label>Description</label>
												<Typography id='modal-modal-description' sx={{ mt: 0.5 }}>
													{description}
												</Typography>
											</Box>
										</Modal>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Card>
			)}
		</>
	);
};

export default Post;
