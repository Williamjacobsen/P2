import { useState, useEffect } from "react";

function FetchImage(id) {
  const [image, setImage] = useState();

  useEffect(() => {
    async function fetchImage() {
      try {
        const response = await fetch(
          `http://localhost:3001/product-images/${id}/primary`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch primary image");
        }
        const data = await response.json();
        setImage(data.path);
      } catch (err) {
        console.error("Error fetching images:", err);
      }
    }

    if (id) {
      fetchImage();
    }
  }, [id]);

  return image;
}

export default FetchImage;
