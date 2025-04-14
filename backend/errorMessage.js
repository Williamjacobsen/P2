
// Profile
export const errorWrongEmail = "Email does not have a profile.";
export const errorWrongPassword = "Password does not match email.";
export const errorProfileEmailAlreadyExists = "Another profile already uses that email.";
export const errorProfilePhoneNumberAlreadyExists = "Another profile already uses that phone number.";

// Vendor
export const errorWrongVendorID = "Vendor ID does not exist."

export function getErrorCode(errorMessage) {
  switch (errorMessage) {
    case errorWrongEmail: return 404; // 404 = Not Found
    case errorWrongPassword: return 401; // 401 = Unauthorized
    case errorProfileEmailAlreadyExists: return 409; // 409 = Conflict
    case errorProfilePhoneNumberAlreadyExists: return 409; // 409 = Conflict
    case errorWrongVendorID: return 404; // 404 = Not Found
    default: return 500; // 500 = Internal Server Error
  }
}