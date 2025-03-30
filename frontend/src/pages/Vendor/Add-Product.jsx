import React from "react";
import { useState } from "react";

export default function AddProduct() {
  const [storeID, setStoreID] = useState(-1); // can only do, when auth is done
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0.0);
  const [discountProcent, setDiscountProcent] = useState(0.0);
  const [description, setDescription] = useState("");
  const [clothingType, setClothingType] = useState("");
  const [brand, setBrand] = useState("");
  const [gender, setGender] = useState("");

  return (
    <div>
      <h1>Add Product</h1>
      <div>
        <div>
          <h4 style={{ marginBottom: "2px" }}>Product Name</h4>
          <input
            type="text"
            placeholder="Product Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: "2px" }}>Price</h4>
          <input
            type="text"
            placeholder="Price..."
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: "2px" }}>Discount procent</h4>
          <input
            type="text"
            placeholder="Discount procent..."
            value={discountProcent}
            onChange={(e) => setDiscountProcent(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: "2px" }}>Description</h4>
          <input
            type="text"
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: "2px" }}>Clothing type</h4>
          <input
            type="text"
            placeholder="Clothing type..."
            value={clothingType}
            onChange={(e) => setClothingType(e.target.value)}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: "2px" }}>Brand</h4>
          <input
            type="text"
            placeholder="Brand..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: "2px" }}>Gender</h4>
          <input
            type="text"
            placeholder="Gender..."
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
        </div>
      </div>
      <button
        style={{ marginTop: "20px" }}
        onClick={async () => {
          try {
            // add variable validation ("name" cant be "not null" in database)

            const response = await fetch("http://localhost:3001/add-product", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                storeID,
                name,
                price,
                discountProcent,
                description,
                clothingType,
                brand,
                gender,
              }),
            });

            if (!response.ok) throw new Error("Failed to add product");

            setName("");
            setPrice(0.0);
            setDiscountProcent(0.0);
            setDescription("");
            setClothingType("");
            setBrand("");
            setGender("");

            alert("Product added successfully!");
          } catch (error) {
            console.error("Error:", error);
            alert("Error adding product");
          }
        }}
      >
        Add Product
      </button>
    </div>
  );
}
