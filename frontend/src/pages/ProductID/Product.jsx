import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductCSS.css";
import { setCookie } from "../../utils/cookies.js";

export default function ProductPage() {
    const { id } = useParams();
    const [productData, setProductData] = useState([]);
    const [mainImage, setMainImage] = useState();

    /** Finds all data relevant see server.js for database interaction */
    useEffect(() => {
        async function allProductData() {
            const res = await fetch(`http://localhost:3001/product/${id}`);
            await res.json().then((productData) => {
                setProductData(productData);
                setMainImage(productData[0]); // Initializing first Image
            });
        }
        allProductData();
    }, [id]);

    /** Made to switch main image */
    const onImgClick = (image) => {
        setMainImage(image);
    };

    return (
    <div className="container">
        <div className="left-content">
            {productData.length > 0 && (
                <div className="image-gallery">
                    <div className="main-image-container">
                        <img
                            src={mainImage.Path}
                            alt={`Product ${mainImage.ID}`}
                            className="main-image"
                            onError={(e) => {
                                e.target.src = '/PlusIcon.jpg';
                            }}/>
                    </div>
                    <div className="thumbnail-row">
                        {productData.map((product, i) => (
                            product?.Path && (
                                <div key={product.id} className="thumbnail-container">
                                    <button onClick={() => onImgClick(product)}><img
                                        key={i}
                                        src={product.Path}
                                        alt={`Thumbnail ${product.ID}`}
                                        className="thumbnail-image"
                                        onError={(e) => {
                                            e.target.src = '/PlusIcon.jpg';
                                        }}/></button>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
        <div className="right-content">
            <p className="product-brand">{productData[0]?.Brand}</p>
            <p className="product-name">{productData[0]?.Name}</p>
            <p className="product-price">{productData[0]?.Price} DKK</p>
            <div>
                <select id="category" defaultValue="" className="SortBox" style={{ width: "300px" }}>
                <option value="SIZE" hidden={true}>SIZE</option>
                <option value="small">small</option>
                <option value="medium">medium</option>
                <option value="large">large</option>
                </select>
            </div>
            <div>
                <select id="category" defaultValue="" style={{ width: "100px" }}>
                <option value="AMOUNT" hidden={true}>AMOUNT</option>
                {[...Array(10)].map((e, i) => <option value={i+1} key={i}>{i+1}</option>)}
                </select>
                <button id="button" defaultValue="" style={{ width: "200px" }} onClick={() =>
                    setCookie(productData[0]?.Name, productData[0]?.ID, null, `/product/${productData[0]?.ID}`)}>ADD TO CART</button> 
                    {/* Made to make a cookie with product name, id, keep cookie till browser closed, path to product. Check cookies.js for more info */}
            </div>
            <div>
                <p>{productData[0]?.Description}</p>
            </div>
        </div>
    </div>
  );
};
