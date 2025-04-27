
import { check } from "express-validator"; // Link to docs and API: https://express-validator.github.io/docs/, or alternatively: https://github.com/validatorjs/validator.js

// NOTE:
// The difference between validators and sanitizers in express-validator
// is whether or not they throw an error (validators), or change the
// input without throwing an error (sanitizers).

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Functions
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Checks the express-validation validation result.
 * If validation fails, this sends an error message via the HTTP response and then throws an error.
 * @param additionalHandling Function. If validation fails, this gets executed before the default error handling logic.
 */
export function handleValidationErrors(httpRequest, httpResponse, validationResult, additionalHandling = function (validationErrors) { }) {
  const validationErrors = validationResult(httpRequest);
  if (!validationErrors.isEmpty()) {
    additionalHandling(validationErrors);
    const firstErrorPath = validationErrors.array()[0].path;
    const errorMessage = `Input is invalid for the input: ${firstErrorPath}`;
    httpResponse.status(400).json({ error: errorMessage }); // 400 = Bad request
    throw Error(errorMessage);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Validators
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

// Profile
export const validateEmail = check("email")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 150 })
export const validatePassword = check("password")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 500 })
export const validateProfileRefreshToken = check("profileRefreshToken")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 255 })
export const validateProfileAccessToken = check("profileAccessToken")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 255 })
export const validatePhoneNumber = check("phoneNumber")
  .bail()
  .escape()
  .notEmpty()
  .isNumeric()
  .isLength({ min: 8, max: 16 })
export const validateProfilePropertyName = check("propertyName")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isIn([
    "Email",
    "Password", // Remember that this is not the same as the MySQL database property "PasswordHash"
    "PhoneNumber"
  ])
/**
 * This does not take into account the corresponding property name, 
 * so this is part 1 of 2 validation checks.
 */
export const validateProfileNewValue_Part1Of2 = check("newValue")
  .bail()
  .escape()
  .notEmpty()
  .isString()
/**
 * This only takes into account the validation relative to the corresponding property name, 
 * so this is part 2 of 2 validation checks.
 * If validation fails, this sends an error message via the HTTP response and then throws an error.
 */
export function validateProfileNewValue_Part2Of2(httpResponse, propertyName, newValue) {
  let inputIsInvalid = false;
  switch (propertyName) {
    case "Email":
      if (newValue.length > 150) {
        inputIsInvalid = true;
      }
      break;
    case "Password":  // Remember that this is not the same as the MySQL database property "PasswordHash"
      if (newValue.length > 500) {
        inputIsInvalid = true;
      }
      break;
    case "PhoneNumber":
      if (newValue.length > 16) {
        inputIsInvalid = true;
      }
      break;
    default:
      inputIsInvalid = true;
      break;
  }
  if (inputIsInvalid) {
    const error = "Input is invalid for the input newValue in respect to the propertyName"
    httpResponse.status(400).json({ error: error }); // 400 = Bad request
    throw Error(error);
  }
}

// Vendor
export const validateVendorID = check("vendorID")
  .bail()
  .escape()
  .notEmpty()
  .isInt()
export const validateVendorPropertyName = check("propertyName")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isIn([
    "Name",
    "Address",
    "Email",
    "PhoneNumber",
    "Description",
    "BankAccountNumber",
    "CVR"
  ])
/**
 * This does not take into account the corresponding property name,
 * (because I could not figure out how to get the value of
 * the propert name inside the validation chaining used by express-validator) 
 * so this is part 1 of 2 validation checks.
 */
export const validateVendorNewValue_Part1Of2 = check("newValue")
  .bail()
  .escape()
  .notEmpty()
  .isString()
/**
 * This only takes into account the validation relative to the corresponding property name, 
 * (because I could not figure out how to get the value of
 * the propert name inside the validation chaining used by express-validator) 
 * so this is part 2 of 2 validation checks.
 * If validation fails, this sends an error message via the HTTP response and then throws an error.
 */
export function validateVendorNewValue_Part2Of2(httpResponse, propertyName, newValue) {
  let inputIsInvalid = false;
  switch (propertyName) {
    case "Name":
      if (newValue.length > 100) {
        inputIsInvalid = true;
      }
      break;
    case "Address":
      if (newValue.length > 150) {
        inputIsInvalid = true;
      }
      break;
    case "Email":
      if (newValue.length > 150) {
        inputIsInvalid = true;
      }
      break;
    case "PhoneNumber":
      if (newValue.length > 16) {
        inputIsInvalid = true;
      }
      break;
    case "Description":
      if (newValue.length > 500) {
        inputIsInvalid = true;
      }
      break;
    case "BankAccountNumber":
      if (newValue.length > 100) {
        inputIsInvalid = true;
      }
      break;
    case "CVR":
      if (newValue.length > 8) {
        inputIsInvalid = true;
      }
      break;
    default:
      inputIsInvalid = true;
      break;
  }
  if (inputIsInvalid) {
    const error = "Input is invalid for the input newValue in respect to the propertyName"
    httpResponse.status(400).json({ error: error }); // 400 = Bad request
    throw Error(error);
  }
}