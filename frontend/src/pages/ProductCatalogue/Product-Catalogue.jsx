import React, {useState, useEffect} from "react";
import ProductCard from "./Product-Card";
import "./Product-Card.css"
import {CatalogueFilter, CatalogueSearch} from "./Catalogue-Filter";


export default function ProductCatalogue (){
// Filters and sorts needs usestate to react to selections
    const [genderFilter, setGenderFilter] = useState("");
    const [priceSort, setPriceSort] = useState("");
    const [clothingTypeFilter, setClothingTypeFilter] = useState("");
    const [search, setSearch] = useState("");
    const [sizeFilter, setSizeFilter] = useState("");

    //loadedProducts is the actual json of the products that we load in,
    //shownProducts is only references to that array in indices 0,..., n-1
    //since when we filter and sort products we change the size and order of products
    // if the user wants to go back, we would have to query the database again
    //So instead we have shownProducts which is just a reference array that we can freely change and loadedProducts is untouched
    const [loadedProducts, setLoadedProducts] = useState([]);
    const [shownProducts, setShownProducts] = useState([]);

    function clearFilters(){
        setSizeFilter('')
        setSearch('')
        setClothingTypeFilter('')
        setPriceSort('')
        setGenderFilter('')
    }

    function filterAndSortProducts(products){
        //filter and sort are two array methods built into javascript we can use to create a new product array to the user preferences
        let productsIndices = products.map((_, index) => index);
        productsIndices = filterProductsLogic(productsIndices);
        sortProductsLogic(productsIndices);
        return productsIndices;
    }

    function sortProductsLogic(products){

        if (priceSort === '') {
            return products
        }
        if (priceSort === 'Highest Price'){
            return products.sort((product1, product2 ) => {return loadedProducts[product2].Price - loadedProducts[product1].Price;})
        }
        if (priceSort === 'Lowest Price'){
            return products.sort((product1, product2 ) => {return loadedProducts[product1].Price - loadedProducts[product2].Price;})
        }
        return products;
    }

    function filterProductsLogic(productIndices){
        return productIndices.filter(index => {
            const product = loadedProducts[index];
            return (genderFilter === '' || product.Gender === genderFilter) &&
                (clothingTypeFilter === '' || product.ClothingType === clothingTypeFilter)
            //missing product size implementation
        });
    }

//looks advanced, but it simply sets shownProducts to an array of size Products.length just filled with indices 1,2...,Products.length
    function reloadShownProducts(Products){
        setShownProducts(Products.map((_, index) => index))
    }

//useEffect loads products array from database and sets it to the loadedProducts and shownProducts variable
    useEffect(() => {
        async function loadInitialProducts(){
            try{
                const response = await fetch("http://localhost:3001/products");
                if (!response.ok) {
                    throw new Error("Failed to load products");
                }
                const data = await response.json();
                setLoadedProducts(data);
                //shownProducts becomes indices ranging from 0,1,...,n-1
                setShownProducts(data.map((_, index) => index))
            } catch(err){
                console.log('Failed to load products');
            }
        }
        loadInitialProducts();
    }, []);

    //this effect watches for changes in the filtering and sorting and searching options that the user may make
    useEffect(() => {
        if (loadedProducts.length === 0) return;
        setShownProducts(filterAndSortProducts(loadedProducts));
    }, [genderFilter,priceSort,clothingTypeFilter,search,sizeFilter]);

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
// filters take a lot of parameters (props technically) so we can update them when they change
    return (
        <div>
            <div className="FilterElements">
                <CatalogueFilter FilterName={'Gender'}
                                 FilterOptions={genderOptionArray}
                                 value={genderFilter}
                                 onChange={event => setGenderFilter(event.target.value)} />
                <CatalogueFilter FilterName={'Product Type'}
                                 FilterOptions={clothingOptionArray}
                                 value={clothingTypeFilter}
                                 onChange={event => setClothingTypeFilter(event.target.value)} />
                <CatalogueFilter FilterName={'Price'}
                                 FilterOptions={priceOptionArray}
                                 value={priceSort}
                                 onChange={event =>setPriceSort(event.target.value)}/>
                <CatalogueFilter FilterName={'Size'}
                                 FilterOptions={sizeOptionArray}
                                 value={sizeFilter}
                                 onChange={event => setSizeFilter(event.target.value)}/>
                <CatalogueSearch></CatalogueSearch>
                {
                    // we use curly braces to enter JS inside the html (part of React functionality)
                    // then we use a short circuit logic expression that only displays this button if the filters is enabled
                    (genderFilter || search || clothingTypeFilter || sizeFilter || priceSort) &&
                    (<button className={'ClearFilterButton'} onClick={clearFilters}>
                        ❌
                    </button>)
                }
            </div>
            <div className="product-grid">
                {shownProducts.map((productIndex) => {
                    const product = loadedProducts[productIndex]
                    return (
                    <ProductCard id={product.ID} storeName={product.StoreName} productName={product.Name} price={product.Price}></ProductCard>
                    )
                })}
            </div>
        </div>
    )
}