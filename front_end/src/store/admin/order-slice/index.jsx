import axiosClient from "@/apis/axiosClient";
import {createAsyncThunk, createSlice, isAnyOf} from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  orderList: [],
  detailOrder: null,
  isLoadingGetDetail: false,
  isLoadingUpdate: false,
  statisticsOrders: null,
};
export const getAllOrders = createAsyncThunk(
  "adminOrder/getAllOrders",
  async (_, {rejectWithValue}) => {
    try {
      const response = await axiosClient.get(`/api/admin/orders`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data.message || "Something went wrong",
      );
    }
  },
);
export const getDetailOrder = createAsyncThunk(
  "adminOrder/getDetailOrder",
  async (id, {rejectWithValue}) => {
    try {
      const response = await axiosClient.get(`/api/admin/orders/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data.message || "Something went wrong",
      );
    }
  },
);
export const updateOrderStatus = createAsyncThunk(
  "adminOrder/updateOrderStatus",
  async ({id, status}, {rejectWithValue}) => {
    try {
      const response = await axiosClient.put(
        `/api/admin/orders/${id}`,
        {status},
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data.message || "Something went wrong",
      );
    }
  },
);
export const statisticsOrders = createAsyncThunk(
  "adminOrder/statisticsOrders",
  async (_, {rejectWithValue}) => {
    try {
      const response = await axiosClient.get(
        `/api/admin/orders/statisticalOrdersAndRevenues`,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data.message || "Something went wrong",
      );
    }
  },
);
const asyncThunks = [getAllOrders, getDetailOrder, updateOrderStatus];
const AdminOrderSlice = createSlice({
  name: "adminOrder",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.orderList = action.payload.data;
        state.isLoading = false;
      })
      .addCase(getAllOrders.rejected, (state) => {
        state.orderList = [];
        state.isLoading = false;
      })
      .addCase(getDetailOrder.pending, (state) => {
        state.isLoadingGetDetail = true;
      })
      .addCase(getDetailOrder.fulfilled, (state, action) => {
        state.detailOrder = action.payload.data;
        state.isLoadingGetDetail = false;
      })
      .addCase(getDetailOrder.rejected, (state) => {
        state.detailOrder = null;
        state.isLoadingGetDetail = false;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoadingUpdate = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.isLoadingUpdate = false;
      })
      .addCase(updateOrderStatus.rejected, (state) => {
        state.isLoadingUpdate = false;
      })
      .addCase(statisticsOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(statisticsOrders.fulfilled, (state, action) => {
        state.statisticsOrders = action.payload.data;
        state.isLoading = false;
      })
      .addCase(statisticsOrders.rejected, (state) => {
        state.isLoading = false;
      });
  },
});
export default AdminOrderSlice.reducer;
