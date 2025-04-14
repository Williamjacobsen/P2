import React, { useState } from "react";

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

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleAddProduct = async () => {
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

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("http://localhost:3001/add-product", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add product");

      setName("");
      setPrice(0.0);
      setDiscountProcent(0.0);
      setDescription("");
      setClothingType("");
      setBrand("");
      setGender("");
      setImages([]);

      alert("Product added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding product");
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
            placeholder="Product Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <h4>Price</h4>
          <input
            type="text"
            placeholder="Price..."
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <h4>Discount Procent</h4>
          <input
            type="text"
            placeholder="Discount procent..."
            value={discountProcent}
            onChange={(e) => setDiscountProcent(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <h4>Description</h4>
          <input
            type="text"
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <h4>Clothing Type</h4>
          <input
            type="text"
            placeholder="Clothing type..."
            value={clothingType}
            onChange={(e) => setClothingType(e.target.value)}
          />
        </div>
        <div>
          <h4>Brand</h4>
          <input
            type="text"
            placeholder="Brand..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div>
          <h4>Gender</h4>
          <input
            type="text"
            placeholder="Gender..."
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
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
      <button style={{ marginTop: "20px" }} onClick={handleAddProduct}>
        Add Product
      </button>
    </div>
  );
}
