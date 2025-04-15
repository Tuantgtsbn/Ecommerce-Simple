import axiosClient from '@/apis/axiosClient';
import { createAsyncThunk, createSlice, isAnyOf, isPending } from '@reduxjs/toolkit';
const initialState = {
    isLoading: false,
    productList: [],
    statisticsProducts: null
};
export const addProduct = createAsyncThunk(
    'adminProducts/addProduct',
    async (data, { rejectWithValue }) => {
        console.log(data);
        try {
            const response = await axiosClient.post('/api/admin/products/addProduct', data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
export const deleteProduct = createAsyncThunk(
    'adminProducts/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosClient.delete(`/api/admin/products/deleteProduct/${id}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
export const updateProduct = createAsyncThunk(
    'adminProducts/updateProduct',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(
                `/api/admin/products/updateProduct/${id}`,
                data,
                {
                    withCredentials: true
                }
            );
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
export const getAllProducts = createAsyncThunk(
    'adminProducts/getAllProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/api/admin/products/getAllProducts', {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
export const statisticsProducts = createAsyncThunk(
    'adminProducts/statisticsProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/api/admin/products/statisticalProducts', {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
const asyncThunks = [addProduct, deleteProduct, updateProduct, getAllProducts];
const AdminProductsSlice = createSlice({
    name: 'adminProducts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.productList = action.payload.data;
            })
            .addCase(statisticsProducts.fulfilled, (state, action) => {
                state.statisticsProducts = action.payload.data;
            })
            .addMatcher(isAnyOf(...asyncThunks.map((thunk) => thunk.pending)), (state) => {
                state.isLoading = true;
            })
            .addMatcher(
                isAnyOf(
                    ...asyncThunks.map((thunk) => thunk.fulfilled),
                    ...asyncThunks.map((thunk) => thunk.rejected)
                ),
                (state) => {
                    state.isLoading = false;
                }
            );
    }
});
export default AdminProductsSlice.reducer;
