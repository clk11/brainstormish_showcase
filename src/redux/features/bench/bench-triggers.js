import axios from 'axios';
import customAxios from '../../../server/utils/customAxios';
import {
	getMembership, getMembershipFailed, manageMembership, manageMembershipFailed, retrieveData, retrieveDataFailed, uploadChatImage, uploadChatImageFailed
} from './bench-slice';

export const GetMembership = async (dispatch, data) => {
	try {
		const queryParams = Object.keys(data)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
			.join('&');

		const url = `/bench/membership/?${queryParams}`;
		const res = await customAxios.get(url);
		dispatch(getMembership(res.data))
		return 1;
	} catch (error) {
		dispatch(getMembershipFailed(error.response.data.err))
		return 0;
	}
}

export const ManageMembership = async (dispatch, data) => {
	try {
		const queryParams = Object.keys(data)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
			.join('&');

		const url = `/bench/manageMembership/?${queryParams}`;
		const res = await customAxios.put(url);
		dispatch(manageMembership(res.data))
		return 1;
	} catch (error) {
		dispatch(manageMembershipFailed(error.response.data.err))
		return 0;
	}
}

export const RetrieveData = async (dispatch, data) => {
	try {
		const queryParams = Object.keys(data)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
			.join('&');
		await customAxios.get(`/bench/retrieve/?${queryParams}`);
		dispatch(retrieveData());
		return 1;
	} catch (error) {
		dispatch(retrieveDataFailed(error.response.data.err))
		return 0;
	}
}

export const UploadChatImage = async (dispatch, data) => {
	try {
		const res = await axios.post(`${import.meta.env.VITE_API_URL}/bench/upload_chat_image`, { image: data }, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true, })
		dispatch(uploadChatImage());
		return res.data;
	} catch (error) {
		dispatch(uploadChatImageFailed(error.response.data.err))
		return 0;
	}
}