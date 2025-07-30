import axiosClient from "@/apis/axiosClient";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
const initialState = {
  isLoading: false,
  error: null,
  listReviews: [],
};
export const addReview = createAsyncThunk(
  "ShoppingAddReview",
  async (data, {rejectWithValue}) => {
    try {
      const response = await axiosClient.post("/api/shop/review", data, {
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
export const getReviewsByProductId = createAsyncThunk(
  "ShoppingGetReviews",
  async (productId, {rejectWithValue}) => {
    try {
      const response = await axiosClient.get(`/api/shop/review/${productId}`, {
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
const ShoppingReviewSlice = createSlice({
  name: "ShoppingReview",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getReviewsByProductId.fulfilled, (state, action) => {
        state.listReviews = action.payload.data;
        state.isLoading = false;
      })
      .addCase(getReviewsByProductId.rejected, (state, action) => {
        state.listReviews = [];
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(getReviewsByProductId.pending, (state) => {
        state.isLoading = true;
      });
  },
});

export default ShoppingReviewSlice.reducer;
