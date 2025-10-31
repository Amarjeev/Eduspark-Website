// 🛠️ Axios is used to send the password change request
import axios from "axios";
import { BaseUrl } from "../../../../BaseUrl/BaseUrl";

// 📦 Custom hook to handle all homework-related API interactions for students
const useArchiveHomework = async (status,className,subjectName,startDate) => {
  // 📥 Fetch all homework assigned to the student
  if (status === 'get') {
    try {
      
      const homeworkData = await axios.get(
        `${BaseUrl}teacher/homework-verification-list?selectedClass=${className}&selectedSubject=${subjectName}&selectedDate=${startDate}`,
        { withCredentials: true } // 🧾 Send cookies for authentication
      );

      return homeworkData.data;
    } catch (error) {
      throw error;
    }
  }
};

const useHomeworkAnswer = async (status, id,role) => {
  if (status === 'get-answerStudentList') {
    try {
      const response = await axios.get(
        `${BaseUrl}teacher/homework-answer?homeworkId=${id}&status=${status}`,
        { withCredentials: true }
      );
      return response.data.studentIds;

    } catch (error) {
      throw error;
    }
  }

  if (status === 'get-studentSumbitedAnswer') {
        try {
      const response = await axios.get(
        `${BaseUrl}teacher/homework-answer/${role}?homeworkId=${id.homeWorkId}&studentId=${id.studentId}&status=${status}`,
        { withCredentials: true }
          );
      return response.data.data;

    } catch (error) {
      throw error;
    }
  }
};

const useverifySubmittedAnswer = async (data) => {
  try {
    const response = await axios.post(
      `${BaseUrl}homework/verify-submission`,
      data,
      { withCredentials: true }
    );
    return response.data;
    
  } catch (error) {
    throw error; // Forward error to caller
  }
};




export  { useArchiveHomework, useHomeworkAnswer , useverifySubmittedAnswer};
