console.log("add-product: 1");

import express from "express";
import pool from "../db.js";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
//import AWS from "aws-sdk";
//import multerS3 from "multer-s3";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

console.log("add-product: 2 - Imported libraries");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

console.log("add-product: 2.5 - S3 Client created");

const router = express.Router();

console.log("add-product: 3 - Express router created");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("__filename:", __filename);
console.log("__dirname:", __dirname);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//const s3 = new AWS.S3({
//  region: process.env.AWS_REGION,
//  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//});

//const storageUpload = multer({
//  storage: multerS3({
//    s3: s3,
//    bucket: process.env.AWS_BUCKET_NAME,
//    acl: "public-read", // makes uploaded files public (optional but needed if you want direct URL access)
//    contentType: multerS3.AUTO_CONTENT_TYPE,
//    key: function (req, file, cb) {
//      const safeFilename = file.originalname
//        .replace(/\s+/g, "_")
//        .replace(/#/g, "");
//      cb(null, `uploads/${Date.now()}-${safeFilename}`);
//    },
//  }),
//  fileFilter: (req, file, cb) => {
//    if (file.mimetype.startsWith("image/")) {
//      cb(null, true);
//    } else {
//      cb(new Error("Only image files are allowed"), false);
//    }
//  },
//});

//console.log("add-product: 4 - storage configured");

//const fileFilter = (req, file, cb) => {
//  console.log("fileFilter - mimetype:", file.mimetype);
//  if (file.mimetype.startsWith("image/")) {
//    cb(null, true);
//  } else {
//    cb(new Error("Only image files are allowed"), false);
//  }
//};

//console.log("add-product: 5 - fileFilter configured");

const ensureArray = (val) => {
  console.log("ensureArray - input value:", val);
  if (Array.isArray(val)) {
    return val;
  }
  if (val != null) {
    return [val];
  }
  return [];
};

console.log("add-product: 6 - ensureArray function created");

//const upload = multer({ storageUpload, fileFilter });

console.log("add-product: 7 - multer upload middleware created");

router.post("/", upload.array("images", 10), async (req, res) => {
  console.log("POST / - Received request");
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);

  // try {
  console.log("Parsing request body fields");
  const {
    storeID,
    name,
    price,
    discountProcent,
    description,
    clothingType,
    brand,
    gender,
  } = req.body;

  console.log("Parsed fields:", {
    storeID,
    name,
    price,
    discountProcent,
    description,
    clothingType,
    brand,
    gender,
  });

  console.log("Inserting product into database...");
  const [result] = await pool.query(
    `INSERT INTO p2.Product
         (StoreID, Name, Price, DiscountProcent, Description, ClothingType, Brand, Gender)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      storeID,
      name,
      price,
      discountProcent,
      description,
      clothingType,
      brand,
      gender,
    ]
  );

  console.log("Product inserted into database, insertId:", result.insertId);

  const productId = result.insertId;

  console.log("image path environment variable:", process.env.AWS_BUCKET_URL);

  if (req.files) {
    console.log("Files received, processing uploads...");
    //console.log("Processing uploaded files");
    //for (const file of req.files) {
    //  console.log("Processing file:", file.filename);
    //  const imageUrl = `${process.env.BACKEND_URL}/uploads/${file.filename}`;
    //  console.log("Image URL:", imageUrl);
    //  await pool.query(
    //    `INSERT INTO p2.ProductImage (ProductID, Path) VALUES (?, ?)`
    //    [productId, imageUrl]
    //  );
    //  console.log("Inserted image record into ProductImage table");
    //}

    for (const file of req.files) {
      const safeFilename = `${Date.now()}-${file.originalname
        .replace(/\s+/g, "_")
        .replace(/#/g, "")}`;

      console.log("Uploading file to S3:", safeFilename);
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: safeFilename,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      console.log("Saving path into database");
      const imageUrl = `${process.env.CLOUD_FRONT_URL}/${safeFilename}`;
      await pool.query(
        `INSERT INTO p2.ProductImage (ProductID, Path) VALUES (?, ?)`,
        [productId, imageUrl]
      );
      console.log("Uploaded file to S3:", safeFilename);
    }
  } else {
    console.log("No files uploaded");
  }

  console.log("Processing sizes and stocks");
  const sizes = ensureArray(req.body.size);
  const stocks = ensureArray(req.body.stock);

  console.log("Sizes parsed:", sizes);
  console.log("Stocks parsed:", stocks);

  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const stock = parseInt(stocks[i]);
    console.log(`Inserting size and stock - Size: ${size}, Stock: ${stock}`);
    await pool.query(
      `INSERT INTO p2.ProductSize (ProductID, Size, Stock) VALUES (?, ?, ?)`,
      [productId, size, stock]
    );
    console.log("Inserted into ProductSize table:", { size, stock });
  }

  console.log("Sending success response");

  res.status(201).json({
    message: "Product added successfully",
    productId,
    //img: file.location,
  });

  // } catch (error) {
  //   console.error("Error adding product:", error);
  //   res.status(500).json({
  //     message: "Error adding product to database",
  //     error: error,
  //     req_body: req.body,
  //   });
  // }
});

console.log("add-product: 8 - router.post configured");

export default router;
