import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Progress = () => {
	return (
		<Box justifyContent='center' sx={{ display: 'flex' }}>
			<CircularProgress />
		</Box>
	);
};

export default Progress;
