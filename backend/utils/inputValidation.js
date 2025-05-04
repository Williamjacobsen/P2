import { check, query } from "express-validator"; // Link to docs and API: https://express-validator.github.io/docs/, or alternatively: https://github.com/validatorjs/validator.js

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
export function handleValidationErrors(
  httpRequest,
  httpResponse,
  validationResult,
  additionalHandling = function (validationErrors) {}
) {
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
  .isLength({ max: 150 });
export const validatePassword = check("password")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 500 });
export const validateProfileRefreshToken = check("profileRefreshToken")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 255 });
export const validateProfileAccessToken = check("profileAccessToken")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isLength({ max: 255 });
export const validatePhoneNumber = check("phoneNumber")
  .bail()
  .escape()
  .notEmpty()
  .isNumeric()
  .isLength({ min: 8, max: 16 });
export const validateProfilePropertyName = check("propertyName")
  .bail()
  .escape()
  .notEmpty()
  .isString()
  .isIn([
    "Email",
    "Password", // Remember that this is not the same as the MySQL database property "PasswordHash"
    "PhoneNumber",
  ]);
/**
 * This does not take into account the corresponding property name,
 * so this is part 1 of 2 validation checks.
 */
export const validateProfileNewValue_Part1Of2 = check("newValue")
  .bail()
  .escape()
  .notEmpty()
  .isString();
/**
 * This only takes into account the validation relative to the corresponding property name,
 * so this is part 2 of 2 validation checks.
 * If validation fails, this sends an error message via the HTTP response and then throws an error.
 */
export function validateProfileNewValue_Part2Of2(
  httpResponse,
  propertyName,
  newValue
) {
  let inputIsInvalid = false;
  switch (propertyName) {
    case "Email":
      if (newValue.length > 150) {
        inputIsInvalid = true;
      }
      break;
    case "Password": // Remember that this is not the same as the MySQL database property "PasswordHash"
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
    const error =
      "Input is invalid for the input newValue in respect to the propertyName";
    httpResponse.status(400).json({ error: error }); // 400 = Bad request
    throw Error(error);
  }
}

// Vendor
export const validateVendorID = check("vendorID")
  .bail()
  .escape()
  .notEmpty()
  .isInt();
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
    "CVR",
    "FAQ",
  ]);
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
  .isString();
/**
 * This only takes into account the validation relative to the corresponding property name,
 * (because I could not figure out how to get the value of
 * the propert name inside the validation chaining used by express-validator)
 * so this is part 2 of 2 validation checks.
 * If validation fails, this sends an error message via the HTTP response and then throws an error.
 */
export function validateVendorNewValue_Part2Of2(
  httpResponse,
  propertyName,
  newValue
) {
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
    case "FAQ":
      if (newValue.length > 2000) {
        inputIsInvalid = true;
      }
      break;
    default:
      inputIsInvalid = true;
      break;
  }
  if (inputIsInvalid) {
    const error =
      "Input is invalid for the input newValue in respect to the propertyName";
    httpResponse.status(400).json({ error: error }); // 400 = Bad request
    throw Error(error);
  }
}

// Validate cart products in POST /checkout
export const validateCartProducts = [
  check("products")
    .exists()
    .withMessage("products array is required")
    .isArray({ min: 1 })
    .withMessage("products must be a non-empty array"),
  check("products.*.ID")
    .exists()
    .withMessage("each product must have an ID")
    .isInt({ gt: 0 })
    .withMessage("product ID must be a positive integer"),
  check("products.*.quantity")
    .exists()
    .withMessage("each product must have a quantity")
    .isInt({ gt: 0 })
    .withMessage("quantity must be a positive integer"),
  check("products.*.size")
    .exists()
    .withMessage("each product must have a size")
    .isString()
    .withMessage("size must be a string")
    .isLength({ min: 1, max: 10 })
    .withMessage("size length must be between 1 and 50"),
];

// Validate session_id in GET /checkout/verify-payment
export const validateSessionIdParam = [
  query("session_id")
    .exists()
    .withMessage("session_id parameter is required")
    .isString()
    .withMessage("session_id must be a string")
    .notEmpty()
    .withMessage("session_id cannot be empty"),
];

// Validate GET /add-product
export const validateAddProduct = [
  check("storeID")
    .notEmpty()
    .withMessage("storeID is required")
    .isInt({ gt: 0 })
    .withMessage("storeID must be a positive integer"),
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("name must be 1-100 chars"),
  check("price")
    .notEmpty()
    .withMessage("price is required")
    .isFloat({ min: 0 })
    .withMessage("price must be ≥ 0"),
  check("discountProcent")
    .notEmpty()
    .withMessage("discountProcent is required")
    .isFloat({ min: 0, max: 100 })
    .withMessage("discountProcent 0-100"),
  check("description")
    .notEmpty()
    .withMessage("description is required")
    .isString()
    .isLength({ min: 1, max: 250 })
    .withMessage("description 1-250 chars"),
  check("clothingType")
    .notEmpty()
    .withMessage("clothingType is required")
    .isString(),
  check("brand")
    .notEmpty()
    .withMessage("brand is required")
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage("brand 1-50 chars"),
  check("gender").notEmpty().withMessage("gender is required").isString(),

  // sizes array
  check("size").custom((_, { req }) => {
    const sizes = Array.isArray(req.body.size)
      ? req.body.size
      : [req.body.size].filter(Boolean); // removes undefined
    if (!sizes.length) throw new Error("At least one size is required");
    sizes.forEach((s) => {
      if (typeof s !== "string" || s.length < 1 || s.length > 10) {
        throw new Error("Each size must be 1-10 chars");
      }
    });
    return true;
  }),

  // stock array
  check("stock").custom((_, { req }) => {
    const stocks = Array.isArray(req.body.stock)
      ? req.body.stock
      : [req.body.stock].filter(Boolean);
    if (!stocks.length) throw new Error("At least one stock value is required");
    stocks.forEach((st) => {
      if (!Number.isInteger(parseInt(st, 10)) || parseInt(st, 10) < 0) {
        throw new Error("Each stock must be a non-negative integer");
      }
    });
    return true;
  }),

  check("images").custom((_, { req }) => {
    // The first argument _ would normally be the parsed value of req.body.images
    // but since file uploads arent in the body we ignore it.
    if (!req.files || req.files.length === 0) {
      throw new Error("At least one picture is required");
    }
    return true;
  }),
];
