import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import useGetProfile from "../Profile/useGetProfile";
import useGetVendor from "../Profile/useGetVendor";

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

export default function EditProduct() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const originalData = useRef(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0.0);
  const [discountProcent, setDiscountProcent] = useState(0.0);
  const [description, setDescription] = useState("");
  const [clothingType, setClothingType] = useState("");
  const [brand, setBrand] = useState("");
  const [gender, setGender] = useState("");
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [stockInput, setStockInput] = useState(0);
  const [images, setImages] = useState([]);

  const [isLoadingProfile, profile] = useGetProfile();
  const [isLoadingVendor, vendor] = useGetVendor(profile?.VendorID);

  useEffect(() => {
    if (!vendor) return;
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/edit-product/get/${id}`,
          { method: "GET", credentials: "include" }
        );
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message);
        const p = resData.product;
        setName(p.Name);
        setPrice(p.Price);
        setDiscountProcent(p.DiscountProcent);
        setDescription(p.Description);
        setClothingType(p.ClothingType);
        setGender(p.Gender);
        setBrand(p.Brand);
        setSizes(p.sizes.map((s) => ({ size: s.Size, stock: s.Stock })));
        setImages(p.images.map((url, idx) => ({ id: idx, url })));
        originalData.current = { ...p };
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, vendor]);

  if (isLoadingProfile) return <>Loading login...</>;
  if (profile === undefined) return <Navigate to="/sign-in" replace />;
  if (isLoadingVendor) return <>Loading vendor info...</>;
  if (vendor === null) return <>You are not a vendor.</>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const validate = () => {
    const errs = {};
    if (!name || name.length > 100) errs.name = "Name required (1-100 chars)";
    if (isNaN(price) || price < 0) errs.price = "Price must be ≥ 0";
    if (isNaN(discountProcent) || discountProcent < 0 || discountProcent > 100)
      errs.discount = "Discount 0-100";
    if (!description || description.length > 250)
      errs.description = "Description 1-250 chars";
    if (!clothingOptions.includes(clothingType))
      errs.clothingType = "Select valid clothing type";
    if (!genderOptions.includes(gender)) errs.gender = "Select valid gender";
    if (!brand || brand.length > 50) errs.brand = "Brand 1-50 chars";
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
    const files = e.target.files;
    if (!files) return;
    const newImgs = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImgs]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
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

  const editProduct = async () => {
    const errs = validate();
    if (Object.keys(errs).length) return alert(Object.values(errs).join("\n"));

    const formData = new FormData();
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
    images.forEach((img) => {
      if (img.file) formData.append("images", img.file);
      else formData.append("existingImages[]", img.url);
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/edit-product/edit/${id}`,
        { method: "PUT", credentials: "include", body: formData }
      );
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message);
      alert("Product edited successfully!");
      originalData.current = {
        ...originalData.current,
        Name: name,
        Price: price,
        DiscountProcent: discountProcent,
        Description: description,
        ClothingType: clothingType,
        Brand: brand,
        Gender: gender,
        sizes,
        images,
      };
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const undoChanges = () => {
    if (!originalData.current) return;
    const p = originalData.current;
    setName(p.Name);
    setPrice(p.Price);
    setDiscountProcent(p.DiscountProcent);
    setDescription(p.Description);
    setClothingType(p.ClothingType);
    setGender(p.Gender);
    setBrand(p.Brand);
    setSizes(p.sizes.map((s) => ({ size: s.Size, stock: s.Stock })));
    setImages(p.images.map((url, idx) => ({ id: idx, url })));
  };

  return (
    <div>
      <h1>Edit Product</h1>
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
                  <button onClick={() => removeSizeEntry(i)}>
                    Remove
                  </button>{" "}
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
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={img.url}
                  alt={`Product ${i}`}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 5,
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 30,
                    height: 35,
                    cursor: "pointer",
                  }}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={undoChanges}>Undo Changes</button>
      <button onClick={editProduct}>Edit Product</button>
    </div>
  );
}
