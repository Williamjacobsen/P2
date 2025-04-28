import React, {useEffect, useState} from "react";
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

export default function Products({VendorID}) {
    const [vendorProducts, setVendorProducts] = useState([]);

    useEffect(() => {
        async function fetchVendorProducts(){
            try{
                const response = await fetch(`http://localhost:3001/VendorProducts/${VendorID}`)
                if (!response.ok){
                    throw new Error("failed to fetch vendor products")
                }
                const data = await response.json();
                setVendorProducts(data);
            }
            catch (err){
                console.log("failed to fetch vendor products", err)
            }
        }
        fetchVendorProducts();
    }, []);

    return (
    <div className="product-grid">
      <AddProductCard />
        {vendorProducts.map((product) => {
            return (
                <ProductCard
                    id={product.ID}
                    storeName={product.StoreName}
                    productName={product.Name}
                    price={product.Price}>
                </ProductCard>
            )
        })}
    </div>
);
}
