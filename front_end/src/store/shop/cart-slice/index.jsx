import axiosClient from '@/apis/axiosClient';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
    listCartItems: {}
};
export const addProductToCart = createAsyncThunk(
    'ShoppingAddProductToCart',
    async ({ userId, productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(
                '/api/shop/cart',
                { userId, productId, quantity },
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
export const fetchCartItems = createAsyncThunk(
    'ShoppingFetchCartItems',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`/api/shop/cart/${userId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
export const updateCartItemQty = createAsyncThunk(
    'ShoppingUpdateCartItemQty',
    async ({ userId, productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(
                '/api/shop/cart',
                { userId, productId, quantity },
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

export const deleteCartItem = createAsyncThunk(
    'ShoppingDeleteCartItem',
    async ({ userId, productId }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.delete('/api/shop/cart', {
                data: { userId, productId },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Something went wrong');
        }
    }
);
const asyncThunks = [addProductToCart, fetchCartItems, updateCartItemQty, deleteCartItem];
const ShoppingCartSlice = createSlice({
    name: 'ShoppingCart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.listCartItems = action.payload.data;
            })
            .addCase(fetchCartItems.rejected, (state) => {
                state.listCartItems = {};
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

export default ShoppingCartSlice.reducer;
