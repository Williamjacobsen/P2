import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import useGetProfile from "../Profile/useGetProfile";
import useGetVendor from "../Profile/useGetVendor";
import { getAllCookieProducts } from "../../utils/cookies";

const genderOptions = ["Male", "Female", "Unisex"];
const clothingOptions = [
  "T-shirts",
  "Shirts",
  "Hoodies",
  "Sweaters",
  "Jackets",
  "Coats",
  "Pants",
  "Jeans",
  "Shorts",
  "Skirts",
  "Dresses",
  "Underwear",
  "Swimwear",
  "Accessories",
  "Footwear",
];

export default function AddProduct() {
  const [storeID, setStoreID] = useState(-1);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0.0);
  const [discountProcent, setDiscountProcent] = useState(0.0);
  const [description, setDescription] = useState("");
  const [clothingType, setClothingType] = useState("");
  const [brand, setBrand] = useState("");
  const [gender, setGender] = useState("");
  const [images, setImages] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [stockInput, setStockInput] = useState(0);
  const [sizes, setSizes] = useState([]);

  // Hooks
  const [isLoadingProfile, profile] = useGetProfile();
  const [isLoadingVendor, vendor] = useGetVendor(profile?.VendorID);
  useEffect(() => {
    (async () => {
      setStoreID(profile?.VendorID);
    })();
  }, [profile]);

  // Is the user signed in?
  if (isLoadingProfile) {
    return <>Loading login...</>;
  } else if (profile === undefined) {
    return <Navigate to="/sign-in" replace />;
  }

  // Is the user a vendor?
  if (isLoadingVendor) {
    return <>Loading vendor information...</>;
  } else if (vendor === null) {
    return <>You are not a vendor, so you do not have access to this page.</>;
  }

  const validate = () => {
    const errs = {};
    if (!name || name.length > 100) errs.name = "Name required (1-100 chars)";
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) errs.price = "Price must be ≥ 0";
    const discNum = parseFloat(discountProcent);
    if (isNaN(discNum) || discNum < 0 || discNum > 100)
      errs.discount = "Discount 0-100";
    if (!description || description.length > 250)
      errs.description = "Description 1-250 chars";
    if (!clothingOptions.includes(clothingType))
      errs.clothingType = "Select a valid clothing type";
    if (!genderOptions.includes(gender)) errs.gender = "Select a valid gender";
    if (!brand || brand.length > 50) errs.brand = "Brand required (1-50 chars)";
    if (sizes.length < 1) errs.sizes = "Add at least one size";
    sizes.forEach(({ size, stock }, i) => {
      if (!size || size.length > 10) errs[`size_${i}`] = "Size 1-10 chars";
      if (!Number.isInteger(stock) || stock < 0)
        errs[`stock_${i}`] = "Stock ≥ 0 integer";
    });
    if (images.length < 1) errs.images = "At least one image required";
    return errs;
  };

  const handleImageChange = (e) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  const addSizeEntry = () => {
    if (!sizeInput) return;
    setSizes([...sizes, { size: sizeInput, stock: stockInput }]);
    setSizeInput("");
    setStockInput(0);
  };

  const removeSizeEntry = (idx) => {
    setSizes(sizes.filter((_, i) => i !== idx));
  };

  const handleAddProduct = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      alert("Fix validation errors: " + JSON.stringify(errs));
      return;
    }

    try {
      const formData = new FormData();
      formData.append("storeID", storeID);
      formData.append("name", name);
      formData.append("price", price);
      formData.append("discountProcent", discountProcent);
      formData.append("description", description);
      formData.append("clothingType", clothingType);
      formData.append("brand", brand);
      formData.append("gender", gender);
      sizes.forEach(({ size, stock }) => {
        formData.append("size", size);
        formData.append("stock", stock);
      });
      images.forEach((image) => formData.append("images", image));

      const response = await fetch("http://localhost:3001/add-product", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.error);

      setName("");
      setPrice(0.0);
      setDiscountProcent(0.0);
      setDescription("");
      setClothingType("");
      setBrand("");
      setGender("");
      setImages([]);
      setSizes([]);
      setSizeInput("");
      setStockInput(0);

      alert("Product added successfully!");
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <div>
      <h1>Add Product</h1>
      <div>
        <div>
          <h4>Product Name</h4>
          <input
            type="text"
            value={name}
            placeholder="Product Name..."
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <div>
            <h4>Price</h4>
            <input
              type="number"
              value={price}
              placeholder="Price..."
              onChange={(e) => setPrice(parseFloat(e.target.value))}
            />
          </div>
          <div>
            <h4>Discount %</h4>
            <input
              type="text"
              value={discountProcent.toString()}
              placeholder="Discount %..."
              onChange={(e) => {
                let input = e.target.value;

                input = input.replace(/[^0-9]/g, "");
                input = input.replace(/^0+/, "") || "0";

                const num = Math.min(100, parseInt(input));

                setDiscountProcent(num);
              }}
              maxLength={3}
            />
          </div>
        </div>
        <div>
          <h4>Description</h4>
          <textarea
            value={description}
            placeholder="Description..."
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <h4>Clothing Type</h4>
          <select
            value={clothingType}
            onChange={(e) => setClothingType(e.target.value)}
          >
            <option value="" disabled hidden>
              Select type
            </option>
            {clothingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h4>Gender</h4>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="" disabled hidden>
              Select gender
            </option>
            {genderOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h4>Brand</h4>
          <input
            type="text"
            value={brand}
            placeholder="Brand..."
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div>
          <h4>Sizes & Stock</h4>
          <div>
            <input
              type="text"
              value={sizeInput}
              placeholder="Size (e.g., M)"
              onChange={(e) => setSizeInput(e.target.value)}
            />
            <input
              type="number"
              value={stockInput}
              placeholder="Stock"
              onChange={(e) => setStockInput(parseInt(e.target.value))}
            />
            <button onClick={addSizeEntry}>Add</button>
          </div>
          {sizes.length > 0 && (
            <ul>
              {sizes.map((e, i) => (
                <li key={i}>
                  {e.size} — {e.stock}
                  <button onClick={() => removeSizeEntry(i)}>Remove</button> {/* Implement removeFromCart() */}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4>Product Images</h4>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </div>
      </div>
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
}
