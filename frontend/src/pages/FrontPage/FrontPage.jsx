import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FrontPage.css";
import BoxShop from "./FrontPageStores";
import ProductCard from "../ProductCatalogue/Product-Card";


export default function FrontPage() {
  const navigate = useNavigate();

  const [BestSellers, SetBestSellers] = useState();
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch("http://localhost:3001/front-page/best-sellers");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        SetBestSellers(data);
      } catch (error) {
        console.error("Error loading text:", error);
      }
    };
    fetchBestSellers();
  }, []);

  useEffect(() => {
    const getDataOfBestSellers = async () => {
      if (!BestSellers) {
        return;
      }

      const allData = [];
      await Promise.all(
        BestSellers.map(async (product, index) => {
          try {
            const res = await fetch(
              `http://localhost:3001/product/${product.ProductID}`
            );
            const data = await res.json();
            allData[index] = data;
          } catch (error) {
            console.error(
              `Error fetching product ${product.ProductID}:`,
              error
            );
          }
        })
      );
      setProductData(allData);
    };
    getDataOfBestSellers();
  }, [BestSellers]);

  return (
    <section>
      <div className="background">
        <div className="content">
          <h1>
            Aalborg <span>Clothing Shops</span>
          </h1>
          <p>Discover and shop your favorite local stores — all in one place. Find the styles you love and pick them up in-store, ready when you are!</p>

          <div className="buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/Product-Catalogue")}
            >
              {" "}
              Shop Now
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate("/Sign-In")}
            >
              View Profile
            </button>
          </div>
          <BoxShop />
        </div>
      </div>
      <div className="fp-products">
        <h1>Best Sellers</h1>
        <div className="product-grid">
          {productData.map((Data, index) => {
            const product = Data[0];
            return (
              <ProductCard
                key={index}
                id={product.ID}
                storeName={product.StoreName}
                productName={product.Name}
                price={product.Price}
                productBrand={product.Brand}
                discount={product.DiscountProcent}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
