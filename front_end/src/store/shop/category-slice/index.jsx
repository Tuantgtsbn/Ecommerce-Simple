import axiosClient from '@/apis/axiosClient';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoading: true,
    listCategory: []
};
const getAllCategories = createAsyncThunk(
    'ShoppingGetCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/api/common/category');
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
const ShoppingCategorySlice = createSlice({
    name: 'ShoppingCategory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllCategories.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.listCategory = action.payload.data;
                state.isLoading = false;
            })
            .addCase(getAllCategories.rejected, (state) => {
                state.listCategory = [];
                state.isLoading = false;
            });
    }
});
export default ShoppingCategorySlice.reducer;
export { getAllCategories };
