// src/utils/formValidation.js

// ======== Individual Field Validators ========

// export function validateRequiredField(field, fieldname) {
//     console.log(field, fieldname, );
    
//   if (!field?.trim()) return `${fieldname} is required`;
//   return null;
// }

export function validateUsername(username) {
  if (!username?.trim()) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  return null;
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!re.test(email)) return "Invalid email address";
  return null;
}

export function validatePassword(password) {
  // return null for now to test
  return null;

  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}


export function validateRequiredField(field, fieldName) {
  if (field === undefined || field === null || String(field).trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
}

export function validatePositiveNumber(field, fieldName) {
  if (field === undefined || field === null || field === "") {
    return `${fieldName} is required`;
  }
  if (isNaN(field) || Number(field) <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}

export function validateBooleanField(field, fieldName) {
  if (typeof field !== "boolean") {
    return `${fieldName} must be true or false`;
  }
  return null;
}

export function validateStatusField(field) {
  const validStatuses = ["active", "inactive"];
  if (!validStatuses.includes(field)) return `Status must be active or inactive`;
  return null;
}

export function validateAddress(address) {
  if (!address?.trim()) return "Address is required";
  if (address.length < 10) return "Address must be at least 10 characters";
  return null;
}

export function validatePincode(pincode) {
  const re = /^[0-9]{5,6}$/; // supports 5 or 6-digit postal codes
  if (!pincode) return "Pincode is required";
  if (!re.test(pincode)) return "Invalid pincode format";
  return null;
}

export function validateCardNumber(cardNumber) {
  const re = /^[0-9]{16}$/;
  if (!cardNumber) return "Card number is required";
  if (!re.test(cardNumber)) return "Card number must be 16 digits";
  return null;
}

// ======== Form-Level Validators ========

export function validateLoginForm({ username, password }) {
  const errors = {};
  const emailError = validateUsername(username);
  if (emailError) errors.username = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function validateSignupForm({
  firstName,
  lastName,
  username,
  email,
  password,
  confirmPassword,
}) {
  const errors = {};

  const firstNameError = validateRequiredField(firstName, "First name");
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateRequiredField(lastName, "Last name");
  if (lastNameError) errors.lastName = lastNameError;

  const usernameError = validateUsername(username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(
    password,
    confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
}

export function validateAddEditProductForm(formData, isEditing = false) {
  const errors = {};

  // Name
  const nameError = validateRequiredField(formData.name, "Product name");
  if (nameError) errors.name = nameError;

  // Price
  const priceError = validatePositiveNumber(formData.price, "Price");
  if (priceError) errors.price = priceError;

  // Original Price (optional but must be positive if provided)
  if (formData.originalPrice) {
    const originalPriceError = validatePositiveNumber(formData.originalPrice, "Original price");
    if (originalPriceError) errors.originalPrice = originalPriceError;
  }

  // Category
  const categoryError = validateRequiredField(formData.category, "Category");
  if (categoryError) errors.category = categoryError;

  // Description (optional but minimum length)
  if (formData.description && formData.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  // Stock
  const stockError = validatePositiveNumber(formData.stock, "Stock");
  if (stockError) errors.stock = stockError;

  // isNewProduct (boolean)
  const isNewProductError = validateBooleanField(formData.isNewProduct, "Is new product");
  if (isNewProductError) errors.isNewProduct = isNewProductError;

  // Status
  const statusError = validateStatusField(formData.status);
  if (statusError) errors.status = statusError;

  // Image
  if (!isEditing && !formData.image) {
    errors.image = "Product image is required";
  }

  return errors;
}


export function validateCheckoutForm_Old({ address, pincode, cardNumber }) {
  const errors = {};

  const addressError = validateAddress(address);
  if (addressError) errors.address = addressError;

  const pincodeError = validatePincode(pincode);
  if (pincodeError) errors.pincode = pincodeError;

  const cardError = validateCardNumber(cardNumber);
  if (cardError) errors.cardNumber = cardError;

  return errors;
}


// ======= Checkout Form Validation =======
export function validateCheckoutForm(formData, currentStep) {
  const errors = {};
  if (currentStep === 1) {
    const shippingErrors = validateShippingForm(formData.shippingInfo);
    // return shippingErrors;
    errors.shippingInfo = shippingErrors;
  } else if (currentStep === 2) {
    const paymentErrors = validatePaymentForm(formData.paymentInfo);
    // return paymentErrors;
    // errors.paymentInfo = paymentErrors;
    errors.paymentInfo = {}; // return no error because stripe can validate itself
  }
  return errors;
}
 
// ======= Shipping Form Validation =======
export function validateShippingForm(shippingInfo) {
  const errors = {};

  const firstNameError = validateRequiredField(shippingInfo.firstName, "First Name");
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateRequiredField(shippingInfo.lastName, "Last Name");
  if (lastNameError) errors.lastName = lastNameError;

  const emailError = validateEmail(shippingInfo.email);
  if (emailError) errors.email = emailError;

  const phoneError = validateRequiredField(shippingInfo.phone, "Phone");
  if (phoneError) errors.phone = phoneError;

  const addressError = validateAddress(shippingInfo.address);
  if (addressError) errors.address = addressError;

  const cityError = validateRequiredField(shippingInfo.city, "City");
  if (cityError) errors.city = cityError;

  const stateError = validateRequiredField(shippingInfo.state, "State");
  if (stateError) errors.state = stateError;

  const zipCodeError = validatePincode(shippingInfo.zipCode);
  if (zipCodeError) errors.zipCode = zipCodeError;

  const countryError = validateRequiredField(shippingInfo.country, "Country");
  if (countryError) errors.country = countryError;

  return errors;
}

// ======= Payment Form Validation =======
export function validatePaymentForm(paymentInfo) {
  const errors = {};

  const cardNameError = validateRequiredField(paymentInfo.cardName, "Card Name");
  if (cardNameError) errors.cardName = cardNameError;

  const cardNumberError = validateCardNumber(paymentInfo.cardNumber);
  if (cardNumberError) errors.cardNumber = cardNumberError;

  const expiryDateError = validateRequiredField(paymentInfo.expiryDate, "Expiry Date");
  if (expiryDateError) errors.expiryDate = expiryDateError;

  const cvvError = validateRequiredField(paymentInfo.cvv, "CVV");
  if (cvvError) errors.cvv = cvvError;

  return errors;
}
