// 🛠️ Axios is used to send the login request
import axios from "axios";
import { BaseUrl } from "../BaseUrl/BaseUrl";


// 🔐 Handles user login and redirects to OTP verification on success
const useLoginHandler = async (role, password, uidsecode, email) => {
  try {
    // 📤 Send login request to backend with credentials
    const response = await axios.post(
      `${BaseUrl}${role}/auth/login`,
      {
        email,
        password,
        uidsecode,
      },
      // { withCredentials: true }
    );

     return response?.data;

  } catch (error) {
    alert("Login failed. Please check your credentials and try again.");
    // ❌ Handle login failure or server error
    return {
     isAuth: false,
      message: error.response?.data?.error || "Login failed",
    };
    
  }
};

// 🚀 Export the handler for use in components
export default useLoginHandler;
