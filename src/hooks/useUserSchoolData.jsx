import { useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl/BaseUrl";
import { saveToIndexedDB } from "../utils/indexedDBUtils";

const useUserSchoolData = (role) => {

    const fetchAllData = async () => {
      try {
        const allowedConfigRoles = ["teacher", "admin"];
        const allowedUserRoles = ["teacher", "admin", "student", "parent"];

        const [configRes, userRes] = await Promise.all([
          // Fetch config-data only for teacher/admin
          allowedConfigRoles.includes(role)
            ? axios.get(`${BaseUrl}school/config-data/${role}`, { withCredentials: true })
            : Promise.resolve(null),

          // Fetch user-profile for all allowed user roles
          allowedUserRoles.includes(role)
            ? axios.get(`${BaseUrl}get/${role}/user-profile`, { withCredentials: true })
            : Promise.resolve(null),
        ]);
        const userData = userRes?.data?.userData;

        if (!userData) {
           showError(`Unable to load user data for ${role}. Please try again.`);
          return;
        }

        const ProfileData = {
          employId: userData?.employId || userData?.studentId || "",
          udisecode: userData?.udisecode || "",
          name: userData?.name || "",
          Id: userData?._id || "",
          url: userData?.profilePicUrl || "",
          schoolname: userData?.schoolname || "",
          className: userData?.className || "",
          email: userData?.email || "",
          mobileNumber:userData?.mobileNumber || "",
        };

        await saveToIndexedDB(`${role}_ProfileData`, ProfileData);

        // Handle class and subject saving for teachers/admin
        if (["teacher", "admin"].includes(role)) {
          const classList = userData.assignedClasses?.length
            ? userData.assignedClasses
            : configRes?.data?.classes || [];

          await saveToIndexedDB(`school-class-List-${role}`, classList || []);
          await saveToIndexedDB(`school-subjects-List-${role}`, configRes?.data?.subjects || []);
        }

      } catch (error) {
      //  console.error("Something went wrong. Please log out and log in again.",error);
      }
    };

    if (role) fetchAllData();
};

export default useUserSchoolData;
