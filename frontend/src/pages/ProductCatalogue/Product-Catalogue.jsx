import ProductCard from "./Product-Card";
import "./Product-Card.css"
import CatalogueFilter from "./Catalogue-Filter";

export default function ProductCatalogue (){
    const array = [
        <ProductCard storeName="Shop 1" productName="Pants 1" price={100} imgURL="/Img/TestBillede.png" />,
        <ProductCard storeName="Shop 2" productName="Pants 2" price={100} imgURL="/Img/TestBillede.png" />,
        <ProductCard storeName="Shop 3" productName="Pants 3" price={100} imgURL="/Img/TestBillede.png" />,
        <ProductCard storeName="Shop 4" productName="Pants 4" price={100} imgURL="/Img/TestBillede.png" />,
        <ProductCard storeName="Shop 5" productName="Pants 5" price={100} imgURL="/Img/TestBillede.png" />,
        <ProductCard storeName="Shop 6" productName="Pants 6" price={100} imgURL="/Img/TestBillede.png" />
    ];
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
                {array}
            </div>
        </div>
    )
}

