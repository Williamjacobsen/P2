import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import ProductCard from "./Product-Card";
import "./Product-Card.css"
import { CatalogueFilter, CatalogueSearch } from "./Catalogue-Filter";
import usePages from "../../utils/usePages";

const productsPerPage = 12;

export default function ProductCatalogue() {
    // Filters and sorts needs usestate to react to selections
    const [genderFilter, setGenderFilter] = useState("");
    const [priceSort, setPriceSort] = useState("");
    const [clothingTypeFilter, setClothingTypeFilter] = useState("");
    const [storeFilter, setStoreFilter] = useState("");
    const [search, setSearch] = useState("");

    //loadedProducts is the actual json of the products that we load in,
    //shownProducts is only references to that array in indices 0,..., n-1
    //since when we filter and sort products we change the size and order of products
    // if the user wants to go back, we would have to query the database again
    //So instead we have shownProducts which is just a reference array that we can freely change and loadedProducts is untouched
    const [loadedProducts, setLoadedProducts] = useState([]);
    const [shownProducts, setShownProducts] = useState([]);

    // Hook for page functionality
    const [getVisiblePartOfPageArray, CurrentPageDisplay, PreviousPageButton, NextPageButton] = usePages(shownProducts, productsPerPage);

    const location = useLocation();

    const genderOptionArray = [
        'Male', 'Female'
    ]
    const clothingOptionArray = [
        'T-shirts',
        'Shirts',
        'Hoodies',
        'Sweaters',
        'Jackets',
        'Coats',
        'Pants',
        'Jeans',
        'Shorts',
        'Skirts',
        'Dresses',
        'Underwear',
        'Swimwear',
        'Accessories',
        'Footwear'
    ];

    const priceOptionArray = [
        'Highest Price', 'Lowest Price'
    ]

    //this array is a list of storenames used to filter products by stores they are from,
    //this looks like a crazy oneliner, but I broke it into parts, you should read the bottom step first then go up
    //Step 3: then last we convert the set back into an array and save it into the variable
    const storeOptionArray = Array.from(
        //Step 2: since the array of storenames contain duplicated we convert it to a set with new Set(), sets cannot have duplicates
        new Set(
            //Step 1: we start by creating an array of store names with .map from our loadedProducts.
            loadedProducts.map(
                product => product.StoreName)));

    function clearFilters() {
        setSearch('')
        setClothingTypeFilter('')
        setPriceSort('')
        setGenderFilter('')
        setStoreFilter('')
    }

    function filterAndSortProducts(products) {
        //filter and sort are two array methods built into javascript we can use to create a new product array to the user preferences
        let productsIndices = products.map((_, index) => index);
        productsIndices = filterProductsLogic(productsIndices);
        sortProductsLogic(productsIndices);
        return productsIndices;
    }

    function sortProductsLogic(products) {

        if (priceSort === '') {
            return products
        }
        if (priceSort === 'Highest Price') {
            return products.sort((product1, product2) => { return loadedProducts[product2].Price - loadedProducts[product1].Price; })
        }
        if (priceSort === 'Lowest Price') {
            return products.sort((product1, product2) => { return loadedProducts[product1].Price - loadedProducts[product2].Price; })
        }
        return products;
    }

    function filterProductsLogic(productIndices) {
        return productIndices.filter(index => {
            const product = loadedProducts[index];
            return (genderFilter === '' || product.Gender === genderFilter) &&
                (storeFilter === '' || product.StoreName === storeFilter) &&
                (clothingTypeFilter === '' || product.ClothingType === clothingTypeFilter) &&
                (search === '' || product.Name.toLowerCase().includes(search.toLowerCase()))
        });
    }

    //looks advanced, but it simply sets shownProducts to an array of size Products.length just filled with indices 1,2...,Products.length
    function reloadShownProducts(Products) {
        setShownProducts(Products.map((_, index) => index))
    }

    //useEffect loads products array from database and sets it to the loadedProducts and shownProducts variable
    useEffect(() => {
        async function loadInitialProducts() {
            try {
                const response = await fetch("http://localhost:3001/products");
                if (!response.ok) {
                    throw new Error("Failed to load products");
                }
                const data = await response.json();
                setLoadedProducts(data);
                //shownProducts becomes indices ranging from 0,1,...,n-1
                setShownProducts(data.map((_, index) => index))
            } catch (err) {
                console.log('Failed to load products');
            }
        }
        loadInitialProducts();
    }, []);

    //this effect watches for changes in the filtering and sorting and searching options that the user may make
    useEffect(() => {
        if (loadedProducts.length === 0) return;
        setShownProducts(filterAndSortProducts(loadedProducts));
    }, [loadedProducts, genderFilter, priceSort, clothingTypeFilter, search, storeFilter]);

    //this effect reads the url parameter for store and sets it to the store filter,
    //used when the user clicks a store in the front page and is redirected we need to filter for it here
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const storeFromUrl = params.get('store')
        const searchFromUrl = params.get('search')

        if (storeFromUrl) {
            setStoreFilter(storeFromUrl);
        }
        else {
            setStoreFilter('');
        }
        if (searchFromUrl) {
            setSearch(searchFromUrl);
        }
        else {
            setSearch('')
        }
    }, [location.search]);

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
                    onChange={event => setPriceSort(event.target.value)} />
                <CatalogueFilter FilterName={'Store'}
                    FilterOptions={storeOptionArray}
                    value={storeFilter}
                    onChange={event => setStoreFilter(event.target.value)} />
                <CatalogueSearch value={search} onChange={event => setSearch(event.target.value)} />
                {
                    // we use curly braces to enter JS inside the html (part of React functionality)
                    // then we use a short circuit logic expression that only displays this button if the filters is enabled
                    (genderFilter || search || clothingTypeFilter || priceSort || storeFilter) &&
                    (<button className={'ClearFilterButton'} onClick={clearFilters}>
                        ❌
                    </button>)
                }
            </div>
            <div>
                <CurrentPageDisplay />
                <PreviousPageButton />
                <NextPageButton />
            </div>
            <div className="product-grid">
                {getVisiblePartOfPageArray().map((productIndex) => {
                    const product = loadedProducts[productIndex]
                    return (
                        <ProductCard id={product.ID} storeName={product.StoreName} productName={product.Name} price={product.Price}></ProductCard>
                    )
                })}
            </div>
        </div>
    )
}