import axiosClient from "@/apis/axiosClient";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
const initialState = {
  isLoading: true,
  statisticsUsers: null,
};
export const statisticsUsers = createAsyncThunk(
  "adminUser/statisticsUsers",
  async (_, {rejectWithValue}) => {
    try {
      const response = await axiosClient.get(
        "/api/admin/users/statisticalUsers",
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  },
);
const AdminUserSlice = createSlice({
  name: "adminUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(statisticsUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(statisticsUsers.fulfilled, (state, action) => {
        state.statisticsUsers = action.payload.data;
        state.isLoading = false;
      })
      .addCase(statisticsUsers.rejected, (state) => {
        state.isLoading = false;
      });
  },
});
export default AdminUserSlice.reducer;
