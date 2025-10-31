// 📦 useFormValidation_Parent.jsx

const useFormValidation_Parent = (formData, fieldToValidate = null) => {
  const errors = {};

  const validateField = (name) => {
    const value = formData[name]?.trim();

    switch (name) {
      case 'name':
        if (!value) {
          errors.name = "Please enter your name";
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
          errors.name = "Name can only contain letters and spaces";
        } else if (value.length < 3) {
          errors.name = "Name must be at least 3 characters";
        } else if (value.length > 30) {
          errors.name = "Name must not exceed 30 characters";
        }
        break;

      case 'email':
        if (!value) {
          errors.email = "Please enter your email";
        }
        break;

      case 'mobileNumber':
        if (!value) {
          errors.mobileNumber = "Mobile number is required";
        } else if (!/^[6-9]\d{9}$/.test(value)) {
          errors.mobileNumber = "Mobile number must be a valid 10-digit Indian number starting with 6-9";
        }
        break;

      case 'udisecode':
        if (!value) {
          errors.udisecode = "UDISE code is required";
        } else if (!/^\d{11}$/.test(value)) {
          errors.udisecode = "UDISE code must be exactly 11 digits";
        }
        break; 

    case 'password':
      if (!value) {
        errors.password = "Password is required";
      } else if (!/^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
    errors.password = "Password must be at least 8 characters, include a lowercase letter and a number";
      }
     break;

      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
        }
        break;

      default:
        break;
    }
  };

  // If field is specified, validate only that
  if (fieldToValidate) {
    validateField(fieldToValidate);
  } else {
    // Otherwise, validate all
    Object.keys(formData).forEach((field) => validateField(field));
  }

  return errors;
};

export default useFormValidation_Parent;
