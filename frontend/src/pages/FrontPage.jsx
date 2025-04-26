import React from "react";
import { useNavigate } from "react-router-dom";
import './FrontPage.css';
import BoxShop from "./FrontPageStores";
import ProductCard from "./ProductCatalogue/Product-Card";
import { useState, useEffect } from "react";


export default function FrontPage() {
  const navigate = useNavigate();

  const [BestSellers, SetBestSellers] = useState();
  const [productData, setProductData] = useState([]); // Now will be array of arrays
  const [isLoaded, setIsLoaded] = useState(false);
  const [mainImage, setMainImage] = useState();
  
  useEffect(() => {
    async function allProductData() {
      if (!BestSellers) return;
  
      const allData = [];
  
      // Use Promise.all to wait for all fetches
      await Promise.all(
        BestSellers.map(async (product, index) => {
          try {
            const res = await fetch(`http://localhost:3001/product/${product.ProductID}`);
            const data = await res.json();
            allData[index] = data;
          } catch (error) {
            console.error(`Error fetching product ${product.ProductID}:`, error);
          }
        })
      );
      console.log(allData)
      setProductData(allData); // Set once after all fetches are done
    }
    
    allProductData();
  }, [BestSellers]);
  
  useEffect (() => {
    setIsLoaded(true);
    console.log(productData)
  }, [productData]);


  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch("http://localhost:3001/BestSellers");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        SetBestSellers(data);
        console.log(data);
      } catch (error) {
        console.error("Error loading text:", error);
      }
    }
    fetchBestSellers();
  },[]);

  return (
  <section>
    <div className="background">
        <div className="content">
        <h1>Aalborg <span>Clothing Shops</span></h1>
          <p>Lorem ipsum, dolor sit amet consectetur... </p>
      
      <div className="buttons"  >
        <button 
          className="primary-btn" 
          onClick={() => navigate('/Product-Catalogue')}> Shop Now</button>
        <button 
          className="secondary-btn" 
          onClick={() => navigate('/Sign-In')}>View Profile</button>
      </div>
        <BoxShop/>
      </div>
      </div>
      <div className="fp-products">
        <h1>Best Sellers</h1>
        <div className="product-grid">
        <ProductCard
            storeName="Shop 1"
            productName = "Pants 1"
            price={100}
            imgURL="/Img/TestBillede.png"
          />   <ProductCard
          storeName="Shop 1"
          productName = "Pants 1"
          price={100}
          imgURL="/Img/TestBillede.png"
          />   <ProductCard
            storeName="Shop 1"
            productName = "Pants 1"
            price={100}
            imgURL="/Img/TestBillede.png"
          />   
          <ProductCard
            storeName="Shop 1"
            productName = "Pants 1"
            price={100}
            imgURL="/Img/TestBillede.png"
          />   
          </div>
      </div>
  
    </section>
  );
};
/*
<ProductCard
storeName="Shop 1"
productName = {data.Name}
price={100}
imgURL="/Img/TestBillede.png"
/> */

/* {BestSellers?.map((data, i) => {
  return (
    <div key={i}>
      <h4>{data.ProductID}</h4>
      <h4>{data.AmountSold}</h4>
    </div>
  );
}
)} 
{isLoaded && productData?.map((data, i) => {

console.log(data);
}
)}  */