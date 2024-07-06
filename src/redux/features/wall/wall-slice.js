import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	posts: null,
	errors: null,
	user: null,
};

const wallSlice = createSlice({
	name: 'wall',
	initialState,
	reducers: {
		addPost(state) {
			state.errors = null;
		},
		addPostFailed(state, action) {
			state.errors = action.payload;
		},
		getPosts(state, action) {
			state.errors = null;
			state.posts = action.payload;
		},
		getPostsFailed(state, action) {
			state.errors = action.payload;
			state.posts = null;
		},
		getUser(state, action) {
			state.errors = null;
			state.user = action.payload;
		},
		getUserFailed(state, action) {
			state.errors = action.payload;
			state.user = null;
		},
		joinDiscussion(state) {
			state.errors = null;
		},
		joinDiscussionFailed(state, action) {
			state.errors = action.payload
		}
	},
});

export const {
	addPost,
	addPostFailed,
	getPosts,
	getPostsFailed,
	getUser,
	getUserFailed,
	joinDiscussionFailed,
	joinDiscussion,
} = wallSlice.actions;
export default wallSlice.reducer;
