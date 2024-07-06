import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	errors: null,
	membership: null,
	info: null,
	imageId: null
};

const benchSlice = createSlice({
	name: 'bench',
	initialState,
	reducers: {
		getMembership(state, action) {
			state.info = action.payload;
			state.membership = true;
			state.errors = null;
		},
		getMembershipFailed(state, action) {
			state.errors = action.payload;
			state.membership = false;
			state.info = null;
		},
		manageMembership(state) {
			state.errors = null;
		},
		manageMembershipFailed(state, action) {
			state.errors = action.payload;
		},
		retrieveData(state) {
			state.errors = null;
		},
		retrieveDataFailed(state, action) {
			state.errors = action.payload;
		},
		uploadChatImage(state) {
			state.errors = null;
		},
		uploadChatImageFailed(state, action) {
			state.errors = action.payload;
		}
	},
});

export const {
	getMembership, getMembershipFailed, manageMembership, manageMembershipFailed, retrieveData, retrieveDataFailed, uploadChatImage, uploadChatImageFailed
} = benchSlice.actions;
export default benchSlice.reducer;
