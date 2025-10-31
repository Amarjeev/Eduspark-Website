export const validateAdminSignup = (formData) => {
  const errors = {};

 // Name
if (!formData.name.trim()) {
  errors.name = "Name is required.";
} else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
  errors.name = "Name must contain only letters and spaces.";
} else if (formData.name.trim().length < 2) {
  errors.name = "Name must be at least 2 characters.";
} else if (formData.name.trim().length > 50) {
  errors.name = "Name must be less than 50 characters.";
}


  // Email
  if (!formData.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Invalid email format.";
  }

  // Password
  if (!formData.password) {
    errors.password = "Password is required.";
  } else if (!/^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
    errors.password = "Password must be at least 8 characters, include a lowercase letter and a number.";
  }

  // Confirm Password
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  // Phone Number
  if (!formData.phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
    errors.phoneNumber = "Phone number must be 10 to 15 digits.";
  }

  // School Type
  if (!formData.schoolType) {
    errors.schoolType = "Please select a school type.";
  }

 // UDISE Code
if (!formData.udisecode.trim()) {
  errors.udisecode = "UDISE code is required.";
} else if (!/^\d+$/.test(formData.udisecode)) {
  errors.udisecode = "UDISE code must contain only numbers.";
} else if (formData.udisecode.length !== 11) {
  errors.udisecode = "UDISE Code must be exactly 11 digits.";
}


// School Name
if (!formData.schoolname.trim()) {
  errors.schoolname = "School name is required.";
}  else if (formData.schoolname.trim().length < 3) {
  errors.schoolname = "School name must be at least 3 characters.";
} else if (formData.schoolname.trim().length > 120) {
  errors.schoolname = "School name must be less than 100 characters.";
}


 // Address validation
if (!formData.address.trim()) {
  errors.address = "Address is required.";
} else if (formData.address.trim().length < 10) {
  errors.address = "Address must be at least 10 characters.";
} else if (formData.address.trim().length > 150) {
  errors.address = "Address must be less than 150 characters.";
}


  // State
  if (!formData.state) {
    errors.state = "Please select a state.";
  }

  return errors;
};
