// utils/uploadImage.js
import axios from "axios";
import { BaseUrl } from "../BaseUrl/BaseUrl";

/**
 * Upload image to the backend
 * @param {FormData} formData - FormData containing the file
 * @param {string} endpoint - Specific endpoint, e.g. "upload-image/teacher"
 * @returns {Promise<Object>} - Axios response data
 */
const uploadImage = async (formData, role) => {
  try {
    const response = await axios.post(`${BaseUrl}upload-image/${role}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data.profilePicUrl;
  } catch (error) {
    throw error;
  }
};

export default uploadImage;
