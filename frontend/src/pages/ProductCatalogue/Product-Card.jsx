import React, {useEffect, useState} from 'react';
import "./Product-Card.css"
import {Link} from "react-router-dom";

export default function ProductCard({id, storeName, productName, price}) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchImages() {
            try {
                // Example with product id 5
                const response = await fetch(`http://localhost:3001/product-images/${id}`);
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
        <Link to={`/product/${id}`} className="product-card-link">
            <div className="product-card">
                <img src={images[0].Path} alt='Product Image'></img>
                <h1>{storeName}</h1>
                <h1>{productName}</h1>
                <p>{price}DKK</p>
            </div>
        </Link>
    );
}