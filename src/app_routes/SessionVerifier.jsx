import axios from "axios";
import { BaseUrl } from "../BaseUrl/BaseUrl";

/**
 * 🔐 Verifies session token based on user role (Admin, Teacher, Parent, etc.)
 * @param {string} role - User role to verify
 * @returns {Promise<boolean>} - Returns true if authenticated, otherwise false
 */
const sessionVerifier = async (role) => {
  try {
    const response = await axios.get(`${BaseUrl}verify-role-session/${role}`, {
      withCredentials: true,
    });
    return response.data.isAuthenticated;
  } catch (error) {
    return false;
  }
};

export default sessionVerifier;
