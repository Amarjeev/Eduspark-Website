// 🛠️ Axios is used to send the password change request
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";

// 📦 Custom hook to handle all homework-related API interactions for students
const useStudentHomework = async (status, role, data) => {

  // 📥 Fetch all homework assigned to the student
  if (status === 'get') {
    try {
      const homeworkData = await axios.get(
        `${BaseUrl}get-homework/${role}`,
        { withCredentials: true } // 🧾 Send cookies for authentication
      );
      return homeworkData.data;
    } catch (error) {
      throw error;
    }
  }

  // 📤 Submit a student's homework answer to the backend
  if (status === 'post') {
    try {
      const homeworkData = await axios.post(
        `${BaseUrl}post-homework/answer/${role}`,
        data, // 📦 Contains answer, homework info, and student data
        { withCredentials: true }
      );
      return homeworkData.data;
    } catch (error) {
      throw error;
    }
  }

  // 📄 Fetch a previously submitted answer for a specific homework
  if (status === 'get-answer') {
    try {
      const homeworkData = await axios.get(
        `${BaseUrl}get-homework/answer/${role}/${data}`,
        { withCredentials: true }
      );
      return homeworkData.data.data; // ✅ Return only the answerText object
    } catch (error) {
      throw error;
    }
  }

};

const useVerifieddHomework = async (role,className,childrenId) => {

  try {
    const response = await axios.get(`${BaseUrl}verify-submitted-homework/${role}?selectedClass=${className}&childrenId=${childrenId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return null; // or throw error if you want to handle it outside
  }
};

export { useStudentHomework ,useVerifieddHomework};
