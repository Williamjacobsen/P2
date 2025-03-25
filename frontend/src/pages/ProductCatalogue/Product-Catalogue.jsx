import ProductCard from "./Product-Card";
import "./Product-Card.css"

export default function ProductCatalogue (){
    return (
        <div className="product-grid">
            <ProductCard storeName="Shop 1" productName="Pants 1" price={100} imgURL="/Img/TestBillede.png" />
            <ProductCard storeName="Shop 2" productName="Pants 2" price={100} imgURL="/Img/TestBillede.png" />
            <ProductCard storeName="Shop 3" productName="Pants 3" price={100} imgURL="/Img/TestBillede.png" />
            <ProductCard storeName="Shop 4" productName="Pants 4" price={100} imgURL="/Img/TestBillede.png" />
            <ProductCard storeName="Shop 5" productName="Pants 5" price={100} imgURL="/Img/TestBillede.png" />
            <ProductCard storeName="Shop 6" productName="Pants 6" price={100} imgURL="/Img/TestBillede.png" />
        </div>
    )
}

