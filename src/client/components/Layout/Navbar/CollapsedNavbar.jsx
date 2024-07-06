import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Modal } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOptions from './MenuOptions';
const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '1.2px solid #000',
	boxShadow: 30,
	pt: 2,
	px: 4,
	pb: 3,
};

const CollapsedNavbar = ({ toggleMode, user }) => {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	return (
		<>
			<div style={{ position: 'sticky', top: 0 }}>
				<IconButton
					onClick={() => {
						setOpen(true);
					}}
					size='large'
					sx={localStorage.getItem("mode") === "dark" ? { color: 'white' } : { color: 'black' }}
				>
					<MenuIcon fontSize='inherit' />
				</IconButton>
				<Modal
					open={open}
					onClose={() => {
						setOpen(false);
					}}
				>
					<Box sx={{ ...style, width: 'auto' }}>
						<MenuOptions
							user={user}
							direction={'column'}
							toggleMode={toggleMode}
							setOpen={setOpen}
							navigate={navigate} />
					</Box>
				</Modal>
			</div>
		</>
	);
};

export default CollapsedNavbar