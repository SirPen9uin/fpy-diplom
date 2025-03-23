import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: { username: string } | null;
  token: string | null;
}

// Безопасное чтение данных из localStorage
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
  token: localStorage.getItem("token") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<{ user: { username: string }; token: string }>) => {
      console.log("Данные при логине:", action.payload);
    
      if (!action.payload.user || !action.payload.token) {
        console.error("Ошибка: user или token отсутствует в payload");
        return;
      }
    
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
