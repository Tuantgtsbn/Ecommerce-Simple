import axiosClient from '@/apis/axiosClient';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
    listContacts: [],
    detailContact: null,
    error: {},
    isLoadingUpdate: false,
    isLoadingGetDetail: false
};

export const getAllContacts = createAsyncThunk(
    'adminContact/getAllContacts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`/api/admin/contact`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data.message || 'Something went wrong');
        }
    }
);

export const getDetailContact = createAsyncThunk(
    'adminContact/getDetailContact',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`/api/admin/contact/${id}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data.message || 'Something went wrong');
        }
    }
);
export const updateContact = createAsyncThunk(
    'adminContact/updateContact',
    async ({ id, read }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(
                `/api/admin/contact/${id}`,
                { read },
                {
                    withCredentials: true
                }
            );
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data.message || 'Something went wrong');
        }
    }
);
const asyncThunks = [getAllContacts, getDetailContact];
const AdminContactSlice = createSlice({
    name: 'adminContact',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllContacts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllContacts.fulfilled, (state, action) => {
                state.listContacts = action.payload.data;
                state.isLoading = false;
                state.error = { ...state.error, getAllContacts: null };
            })
            .addCase(getAllContacts.rejected, (state, action) => {
                state.error = { ...state.error, getAllContacts: action.payload };
            })
            .addCase(getDetailContact.pending, (state) => {
                state.isLoadingUpdate = true;
            })
            .addCase(getDetailContact.fulfilled, (state, action) => {
                state.detailContact = action.payload.data;
                state.error = { ...state.error, getDetailContact: null };
                state.isLoadingUpdate = false;
            })
            .addCase(getDetailContact.rejected, (state, action) => {
                state.error = { ...state.error, getDetailContact: action.payload };
                state.isLoadingUpdate = false;
            })
            .addCase(updateContact.pending, (state) => {
                state.isLoadingUpdate = true;
            })
            .addCase(updateContact.fulfilled, (state) => {
                state.isLoadingUpdate = false;
                state.error = { ...state.error, updateContact: null };
            })
            .addCase(updateContact.rejected, (state, action) => {
                state.isLoadingUpdate = false;
                state.error = { ...state.error, updateContact: action.payload };
            });
    }
});
export default AdminContactSlice.reducer;
