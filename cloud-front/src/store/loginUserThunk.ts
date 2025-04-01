import { Dispatch } from "react";
import { loginUser } from "./authSlice";

export const loginUserThunk = (credentials: { username: string, password: string }) => async (dispatch: Dispatch) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Ошибка при логине");
    }

    const data = await response.json();
    console.log("Данные при логине:", data);
    
    dispatch(loginUser({ user: data.user }));

  } catch (error) {
    console.error("Ошибка при логине:", error);
  }
};
