import React, {useState, useEffect} from "react";
import ProductCard from "./Product-Card";
import "./Product-Card.css"
import CatalogueFilter from "./Catalogue-Filter";


export default function ProductCatalogue (){

const [products, setProducts] = useState([]);
    useEffect(() => {
        async function loadInitialProducts(){
            try{
                const response = await fetch("http://localhost:3001/products");
                if (!response.ok) {
                    throw new Error("Failed to load products");
                }
                const data = await response.json();
                setProducts(data);
            } catch(err){
                console.log('Failed to load products');
            }
        }
        loadInitialProducts();
    }, []);


    const genderOptionArray = [
        'Male','Female'
    ]
    const clothingOptionArray = [
        'T-shirt','Hoodie','Pants','Jeans'
    ]
    const priceOptionArray = [
        'Highest Price','Lowest Price'
    ]
    const sizeOptionArray = [
        'Small', 'Medium', 'Large',
    ]

    return (
        <div>
            <div className="SortBoxes">
                <CatalogueFilter FilterName={'Gender'} FilterOptions={genderOptionArray} />
                <CatalogueFilter FilterName={'Product Type'} FilterOptions={clothingOptionArray} />
                <CatalogueFilter FilterName={'Price'} FilterOptions={priceOptionArray} />
                <CatalogueFilter FilterName={'Size'} FilterOptions={sizeOptionArray} />
            </div>
            <div className="product-grid">
                {products.map((product) => {
                    return (
                    <ProductCard id={product.ID} storeName={product.StoreName} productName={product.Name} price={product.Price}></ProductCard>
                    )
                })}
            </div>
        </div>
    )
}

