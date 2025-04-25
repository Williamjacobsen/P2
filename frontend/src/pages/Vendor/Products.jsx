import React from "react";
import ProductCard from "../ProductCatalogue/Product-Card";
import "./Products.css";
import { useNavigate } from "react-router-dom";

const AddProductCard = () => {
  const navigate = useNavigate();

  return (
    <div className="addProduct" onClick={() => navigate("/vendor/add-product")}>
      <img className="plusIcon" src="/Img/PlusIcon.png" alt="" />
    </div>
  );
};

export default function Products() {
  return (
    <div className="product-grid">
      <AddProductCard />
      <ProductCard
        storeName="Shop 1"
        productName="Pants 1"
        price={100}
        imgURL="/Img/TestBillede.png"
      />
    </div>
  );
}
