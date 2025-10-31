import axios from 'axios';
import { BaseUrl } from "../../BaseUrl/BaseUrl";

// Function to request UDISE code recovery based on email or password
async function requestUdisecodeRecovery(data, id,navigate) {
  const email = data?.email;
  const password = data?.password;
  const role = data?.role?.toLowerCase();

  // Return early if both email and password are missing
  if (!email && !password) {
    return {
      success: false,
      message: "Email or Password is required.",
    };
  }

  try {
    let payload = {};
    
    // Build request payload with email or password
    if (email) {
      payload.email = email;
      payload.role = role;
    }

    if (password) {
      payload.password = password;
      payload.id = id; // Include ID only in password phase
    }

    // Send POST request to backend API for UDISE code recovery
    const response = await axios.post(`${BaseUrl}forgot-udisecode`, payload);

    // Return response data from the server
    return response.data;

  } catch (error) {
    if (error.response.data.message === "Session expired") {
     navigate("/"); 
    }

    // Return standardized error response
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
      error: error?.response?.data?.message || error.message,
    };
  }
}

export { requestUdisecodeRecovery };
