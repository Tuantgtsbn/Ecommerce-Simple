import axiosClient from "@/apis/axiosClient";
import {
  createAsyncThunk,
  createSlice,
  isAnyOf,
  isPending,
} from "@reduxjs/toolkit";
import {set} from "react-hook-form";

const initialState = {
  isLoading: false,
  listAddress: [],
  idAddressEdited: null,
  addressChoosen: null,
};
const addAddress = createAsyncThunk(
  "ShoppingAddAddress",
  async (data, {rejectWithValue}) => {
    try {
      const response = await axiosClient.post("/api/shop/address", data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  },
);
const editAddress = createAsyncThunk(
  "ShoppingEditAddress",
  async ({addressId, formData}, {rejectWithValue}) => {
    try {
      const response = await axiosClient.put(
        `/api/shop/address/${addressId}`,
        formData,
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
const deleteAddress = createAsyncThunk(
  "ShoppingDeleteAddress",
  async (addressId, {rejectWithValue}) => {
    try {
      const response = await axiosClient.delete(
        `/api/shop/address/${addressId}`,
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
const fetchListAddress = createAsyncThunk(
  "ShoppingFetchListAddress",
  async (userId, {rejectWithValue}) => {
    try {
      const response = await axiosClient.get(`/api/shop/address/${userId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  },
);
const asyncThunks = [addAddress, editAddress, deleteAddress, fetchListAddress];
const ShoppingAddressSlice = createSlice({
  name: "ShoppingAddress",
  initialState,
  reducers: {
    setAddressEdited: (state, action) => {
      state.idAddressEdited = action.payload;
    },
    setAddressChoosen: (state, action) => {
      state.addressChoosen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListAddress.fulfilled, (state, action) => {
        state.listAddress = action.payload.data;
      })
      .addMatcher(
        isAnyOf(...asyncThunks.map((thunk) => thunk.pending)),
        (state) => {
          state.isLoading = true;
        },
      )
      .addMatcher(
        isAnyOf(
          ...asyncThunks.map((thunk) => thunk.fulfilled),
          ...asyncThunks.map((thunk) => thunk.rejected),
        ),
        (state) => {
          state.isLoading = false;
        },
      );
  },
});

export default ShoppingAddressSlice.reducer;
export {addAddress, editAddress, deleteAddress, fetchListAddress};
export const {setAddressEdited, setAddressChoosen} =
  ShoppingAddressSlice.actions;
