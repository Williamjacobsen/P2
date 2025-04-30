import React, { useEffect, useState } from "react";

export default function DisplayProductImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        // Example with product id 5
        const response = await fetch("http://localhost:3001/product-images/5");
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const data = await response.json();
        setImages(data.images);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching images:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  return (
    <div>
      <h2>Images for Product ID 3</h2>
      {images.length === 0 ? (
        <p>No images found for this product.</p>
      ) : (
        images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Product image ${index + 1}`}
            style={{ maxWidth: "300px", margin: "10px" }}
          />
        ))
      )}
    </div>
  );
}
