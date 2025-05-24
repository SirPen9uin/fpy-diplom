import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "../types/types";
import { User } from "../types/types";


const getStoredUser = () => {
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Ошибка парсинга user из localStorage:", error);
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<{ user: User }>) => {

      if (!action.payload.user) {
        console.error("Ошибка: user отсутствует в payload");
        return;
      }

      state.user = action.payload.user;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("user");
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
