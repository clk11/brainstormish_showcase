import * as React from 'react';
import { Button, TextField, Collapse, IconButton, Grid, List, ListItem, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { TransitionGroup } from 'react-transition-group';
import { useState } from 'react';
const displayItem = ({ item, removeItem }) => {
	return (
		<ListItem
			secondaryAction={
				<IconButton
					edge='end'
					aria-label='delete'
					title='Delete'
					onClick={() => removeItem(item)}
					size="large">
					<DeleteIcon />
				</IconButton>
			}
		>
			<ListItemText primary={item} />
		</ListItem>
	);
};


const Tags = ({ setTags, tags }) => {
	const [tag, setTag] = useState('');
	const check_tag = (tag) => {
		var allowedRegex = /^[a-zA-Z0-9\s.#+]+$/;
		if (!allowedRegex.test(tag)) {
			return false;
		}
		return true;
	}
	const addItem = () => {
		if (tag.trim().length !== 0) {
			if (tags.indexOf(tag) === -1) {
				if (check_tag(tag)) {
					const bits = tag.split(' ').filter(x => x !== '');
					let polished_tag = '';
					for (let i = 0; i < bits.length; i++)
						polished_tag += bits[i] + '-';
					polished_tag = polished_tag.substring(0, polished_tag.length - 1);
					setTags(() => {
						let newArr = [...tags];
						newArr.push(polished_tag.toLowerCase());
						return newArr;
					});
					setTag('');
				} else
					alert("Illegal characters detected! Only letters (upper and lower) and spaces are allowed.");
			} else
				alert('Tag already in the list !');
		} else
			alert('You need to add a tag first !');
	};

	const removeItem = (item) => {
		setTags(() => {
			let temp = [...tags.filter((i) => i !== item)];
			return temp;
		});
	};

	const clearAllButton = (
		<Button
			variant='contained'
			color='error'
			onClick={() => {
				setTags(() => {
					let temp = [...tags];
					temp = [];
					return temp;
				});
				setTag('');
			}}
		>
			CLEAR TAGS
		</Button>
	);

	const addItemButton = (
		<Button variant='contained' onClick={addItem}>
			ADD TAG
		</Button>
	);

	return (
		<Grid container spacing={2} sx={{ marginBottom: '1.5625rem' }}>
			<Grid item>
				<TextField
					value={tag}
					onChange={(e) => setTag(e.target.value)}
					size='small'
					id='input'
					required
					label='Introduce a tag'
				/>
			</Grid>
			<Grid item>{addItemButton}</Grid>
			<Grid item>{clearAllButton}</Grid>
			<Grid item>
				<List
					sx={{
						width: '100%',
						maxWidth: 'auto',
						position: 'relative',
						overflow: 'auto',
						maxHeight: '8.125rem',
					}}
				>
					<TransitionGroup>
						{tags.map((item) => (
							<Collapse key={item}>
								{displayItem({ item, removeItem })}
							</Collapse>
						))}
					</TransitionGroup>
				</List>
			</Grid>
		</Grid>
	);
};

export default Tags;
