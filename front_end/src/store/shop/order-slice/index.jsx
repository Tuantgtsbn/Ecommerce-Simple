import axiosClient from '@/apis/axiosClient';
import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
const initialState = {
    isLoading: false,
    approvalURL: null,
    orderId: null,
    orderList: [],
    orderDetails: null
};
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/api/shop/order/create-order', orderData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);
export const capturePayment = createAsyncThunk(
    'order/capturePayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(
                '/api/shop/order/capture-payment',
                paymentData,
                {
                    withCredentials: true
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);
export const getOrdersByUserId = createAsyncThunk(
    'order/getOrdersByUserId',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(
                '/api/shop/order/get-orders',
                { userId },
                {
                    withCredentials: true
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);
export const getOneOrderByUserId = createAsyncThunk(
    'order/getOneOrderByUserId',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`/api/shop/order/${orderId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);
const asyncThunks = [createOrder, capturePayment, getOrdersByUserId, getOneOrderByUserId];
const ShoppingOrderSlice = createSlice({
    name: 'ShoppingOrder',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.approvalURL = action.payload.approvalURL;
                state.orderId = action.payload.orderId;
                sessionStorage.setItem('currentOrderId', JSON.stringify(action.payload.orderId));
            })
            .addCase(createOrder.rejected, (state) => {
                state.isLoading = false;
                state.approvalURL = null;
                state.orderId = null;
            })
            .addCase(getOrdersByUserId.fulfilled, (state, action) => {
                state.orderList = action.payload.data;
                state.isLoading = false;
            })
            .addCase(getOrdersByUserId.rejected, (state) => {
                state.orderList = [];
                state.isLoading = false;
            })
            .addCase(getOneOrderByUserId.fulfilled, (state, action) => {
                state.orderDetails = action.payload.data;
                state.isLoading = false;
            })
            .addCase(getOneOrderByUserId.rejected, (state) => {
                state.orderDetails = null;
                state.isLoading = false;
            })
            .addMatcher(isAnyOf(...asyncThunks.map((thunk) => thunk.pending)), (state) => {
                state.isLoading = true;
            });
    }
});

export default ShoppingOrderSlice.reducer;
