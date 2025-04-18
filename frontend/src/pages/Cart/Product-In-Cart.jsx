import React, {useEffect, useState} from 'react';
import './Cart.css';

function ProductInCart({id, storeName, storeAdress, quantity, size, productName, price, imgURL}) {
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
        <div className={'cartProduct'}>
            <img src={images[0]?.Path || '/Img/MissingImgImg.jpg'} className={'cartImg'} alt={productName}></img>
            <div className={'cartText'}>
                <h1>{storeName}</h1>
                <h2>{storeAdress}</h2>
                <p>{productName}</p>
                <p>{size}</p>
                <h1>{price}</h1>
                <h1>{quantity}</h1>
            </div>
            <div className={'cartRemove'}>
                <button className={'cartRemoveButton'}>Remove</button>
            </div>
        </div>
    );
}

export default ProductInCart;