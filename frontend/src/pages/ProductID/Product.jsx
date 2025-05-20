import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductCSS.css";
import {getCookie, setCookie} from "../../utils/cookies.js";
import { getAllCookieProducts } from "../../utils/cookies.js";
import useGetVendor from "../Profile/useGetVendor.jsx";
import { AmountOfItemsInCart } from "../../utils/AmountOfItemsInCart.js";

export default function ProductPage({ setCartAmount }) {

  const { id } = useParams();
  const [productData, setProductData] = useState([]);
  const [mainImage, setMainImage] = useState();
  const [sizeSelection, setSizeSelection] = useState("");
  const [quantitySelection, setQuantitySelection] = useState(1);
  /** Finds all data relevant see server.js for database interaction */
  useEffect(() => {
    async function allProductData() {
      const res = await fetch(`http://localhost:3001/product/${id}`);
      if (!res.ok) {
        console.error(`Server returned ${res.status}`);
        throw new Error(`Failed to fetch product: ${res.status}`);
      }
      await res.json().then((productData) => {
        setProductData(productData);
        setMainImage(productData[0]); // Initializing first Image
      });
    }
    allProductData();
  }, [id]);

  // Hooks
  const [isLoadingVendor, productVendor] = useGetVendor(productData[0]?.StoreID);

  // Is the user a vendor?
  if (isLoadingVendor) {
    return (<>Loading vendor information...</>);
  }
  else if (productVendor === null) {
    return (<>Error: Product vendor is null.</>);
  }


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
                  e.target.src = "/PlusIcon.jpg";
                }}
              />
            </div>
            <div className="thumbnail-row">
              {productData.map(
                (product, i) =>
                  product?.Path && (
                    <div key={product.id} className="thumbnail-container">
                      <button onClick={() => onImgClick(product)}>
                        <img
                          key={i}
                          src={product.Path}
                          alt={`Thumbnail ${product.ID}`}
                          className="thumbnail-image"
                          onError={(e) => {
                            e.target.src = "/PlusIcon.jpg";
                          }}
                        />
                      </button>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
      <div className="right-content">
        <p className="product-brand">{productData[0]?.Brand}</p>
        <p className="product-vendor">Vendor: {productVendor?.Name}</p>
        <p className="product-name">{productData[0]?.Name}</p>
        {typeof productData[0]?.Price === "number" && (
            <p className="product-price">
              {(
                  productData[0]?.DiscountProcent > 0
                      ? productData[0].Price - (productData[0].Price * productData[0].DiscountProcent) / 100
                      : productData[0].Price
              ).toFixed(2)} kr
            </p>
        )}
        <div>
          <div>
            <label htmlFor="sizeSelection" hidden>Size</label>
            <select
                id="sizeSelection"
                defaultValue={sizeSelection}
                className="SortBox"
                onChange={(e) => {
                  setSizeSelection(e.target.value);
                }}
                style={{ width: "300px" }}
            >
              <option value="SIZE" hidden={true}>
                SIZE
              </option>
              {productData.map((product) => {
                return (
                    <option key={product.Size} value={product.Size}>
                      {product.Size}
                    </option>
                );})}
            </select>
          </div> {/* The function extracts straight from productData so no need for it here */}
        </div>
        <div>
          <label htmlFor="category" hidden>Quantity</label>
          <select
            id="category"
            defaultValue="1"
            onChange={(e) => {
              setQuantitySelection(parseInt(e.target.value));
            }}
            style={{ width: "100px" }}
          >
            <option value="AMOUNT" hidden={true}>
              AMOUNT
            </option>
            {[...Array(productData.find(product => product.Size === sizeSelection)?.Stock || 0)].map((_,i) => (
                <option value={i + 1} key={i}>
                  {i + 1}
                </option>
            ))}
          </select>
          <button
            id="button"
            defaultValue=""
            style={{ width: "200px" }}
            onClick={() => {
              if (!sizeSelection) {
                alert("Please Select a size");
                return;
              }
              const existingCookie = getCookie(`Product-${productData[0]?.ID}-${sizeSelection}`);
              const existingQuantity = existingCookie ? JSON.parse(existingCookie).quantity || 0 : 0;
              const cookievalue = JSON.stringify({
                id: productData[0]?.ID,
                size: sizeSelection,
                quantity: quantitySelection + existingQuantity,
                sizeID: productData[0]?.sizeID
              });
                setCookie(
                    `Product-${productData[0]?.ID}-${sizeSelection}`,
                    cookievalue,
                    null,
                    "/"
                );
              setCartAmount(AmountOfItemsInCart());
            }}
          >
            ADD TO CART
            </button>
          {/* Made to make a cookie with product, id, keep cookie till browser closed, path '/' which means entire website so every page can see. Check cookies.js for more info */}
        </div>
        <div>
          <p>{productData[0]?.Description}</p>
        </div>
      </div>
    </div>
  );
}
