import axiosClient from '@/apis/axiosClient';
import { createAsyncThunk, createSlice, isAnyOf, isPending } from '@reduxjs/toolkit';
const initialState = {
    isLoading: false,
    productList: [],
    detailProduct: null
};
const fetchFilteredProducts = createAsyncThunk(
    'shoppingProducts/fetchFilteredProducts',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`/api/shop/products?${data}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
const fetchDetailProduct = createAsyncThunk(
    'shoppingProducts/fetchDetailProduct',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`/api/shop/products/${id}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
const asyncThunks = [fetchDetailProduct, fetchFilteredProducts];
const ShoppingProductSlice = createSlice({
    name: 'ShoppingProducts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFilteredProducts.fulfilled, (state, action) => {
                state.productList = action.payload.data;
            })
            .addCase(fetchDetailProduct.fulfilled, (state, action) => {
                state.detailProduct = action.payload.data;
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
export default ShoppingProductSlice.reducer;
export { fetchFilteredProducts, fetchDetailProduct };
