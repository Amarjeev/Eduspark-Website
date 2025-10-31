import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";

// 🔐 Handles parent signup by posting form data to backend
const useParentSignup = async (data) => {
  try {
    // 📤 Sending signup data to backend
    const response = await axios.post(`${BaseUrl}parent/signup`, data);
    return response.data; // ✅ Return response if needed
  } catch (error) {
    throw error; // 🔁 Propagate error to caller
  }
};

export default useParentSignup;
