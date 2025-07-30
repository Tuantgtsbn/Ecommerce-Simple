import {createAsyncThunk, createSlice, isAnyOf} from "@reduxjs/toolkit";
import axiosClient from "@/apis/axiosClient";
const initialState = {
  isLoading: false,
  isAuthenticated: false,
  user: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, {rejectWithValue}) => {
    try {
      const response = await axiosClient.post("/api/auth/register", data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log("Error", error);
      return rejectWithValue(
        error.response?.data.message || "Something went wrong",
      );
    }
  },
);
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, {rejectWithValue}) => {
    try {
      const response = await axiosClient.post("/api/auth/login", data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, {rejectWithValue}) => {
    try {
      const response = await axiosClient.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  },
);
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, {rejectWithValue}) => {
    try {
      const response = await axiosClient.get("/api/auth/check-auth", {
        withCredentials: true,
        headers: {
          "Cache-Control":
            "no-cache, no-store, must-revalidate, proxy-revalidate",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  },
);
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, {rejectWithValue}) => {
    try {
      const response = await axiosClient.put(
        "/api/auth/update-profile",
        profileData,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update profile",
      );
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, {rejectWithValue}) => {
    try {
      const response = await axiosClient.post(
        "/api/auth/change-password",
        passwordData,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to change password",
      );
    }
  },
);
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (userId, {rejectWithValue}) => {
    try {
      const response = await axiosClient.get(`/api/auth/${userId}`, {
        withCredentials: true,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to get profile");
    }
  },
);
const asyncThunks = [
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
  updateProfile,
  changePassword,
];
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.success;
        state.user = action.payload.success ? action.payload.user : null;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.success;
        // console.log(action);
        const {_id: id, ...rest} = action.payload.data;
        state.user = {id, ...rest};

        // state.user = action.payload.success ? action.payload.user : null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        const {data} = action.payload;
        const {_id: id, ...rest} = data;
        state.user = {id, ...rest};
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        const {data} = action.payload;
        const {_id: id, ...rest} = data;
        state.user = {id, ...rest};
      })
      .addCase(getProfile.rejected, (state) => {
        state.user = null;
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
export default authSlice.reducer;
