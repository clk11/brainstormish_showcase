import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../features/auth/auth-slice';
import wallSlice from '../features/wall/wall-slice';
import benchSlice from '../features/bench/bench-slice';
export const store = configureStore({
	reducer: {
		auth: authSlice,
		wall: wallSlice,
		bench: benchSlice
	},
});
