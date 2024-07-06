import customAxios from '../../../server/utils/customAxios'
import {
	addPost,
	addPostFailed,
	getPosts,
	getPostsFailed,
	getUser,
	getUserFailed,
	joinDiscussionFailed,
	joinDiscussion,
} from './wall-slice';

export const GetUser = async (dispatch, username) => {
	try {
		const res = await customAxios.get(`/wall/profile/${username}`);
		dispatch(getUser(res.data));
		return 1;
	} catch (error) {
		dispatch(getUserFailed(error.response.data.err));
		return 0;
	}
};

export const AddPost = async (dispatch, data) => {
	try {
		await customAxios.post('/wall', data);
		dispatch(addPost());
		return 1;
	} catch (error) {
		dispatch(addPostFailed(error.response.data.err));
		return 0;
	}
};

export const GetPosts = async (dispatch, data) => {
	try {
		const { type, username } = data;
		let res;
		if (type === 0) res = await customAxios.get('/wall');
		else {
			if (type === 1) res = await customAxios.get(`/wall/${username}/posts/joined`);
			else if (type === 2) res = await customAxios.get(`/wall/${username}/posts`);
		}
		dispatch(getPosts(res.data));
		return 1;
	} catch (error) {
		dispatch(getPostsFailed(error.response.data.err));
		return 0;
	}
};

export const JoinDiscussion = async (dispatch, data, navigate) => {
	try {
		await customAxios.post('/wall/join', data);
		dispatch(joinDiscussion());
		navigate(data.path);
	} catch (error) {
		dispatch(joinDiscussionFailed(error.response.data.err));
	}
}