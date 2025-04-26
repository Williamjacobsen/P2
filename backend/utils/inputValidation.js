
import { body, cookie } from "express-validator";

// Profile
export const validateEmail = body("email")
  .escape()
  .notEmpty()
  .isEmail()
  .normalizeEmail()
  .isLength({ max: 150 });
export const validatePassword = body("password")
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 500 });
export const validateProfileRefreshToken = cookie("profileRefreshToken")
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 255 });
export const validateProfileAccessToken = cookie("profileAccessToken")
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 255 });
export const validatePhoneNumber = body("phoneNumber")
  .escape()
  .notEmpty()
  .isNumeric()
  .isLength({ min: 8, max: 16 });
export const validateProfilePropertyName = body("propertyName") //R
  .escape()
  .notEmpty();
export const validateProfileNewValue = body("newValue") //R
  .escape()
  .notEmpty();

// Vendor
export const validateVendorID = body("vendorID")
  .escape()
  .notEmpty()
  .isInt()
export const validateVendorPropertyName = body("propertyName") //R
  .escape()
  .notEmpty();
export const validateVendorNewValue = body("newValue") //R
  .escape()
  .notEmpty();
