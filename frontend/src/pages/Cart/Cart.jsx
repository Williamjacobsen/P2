import React from "react";
import ProductInCart from "./Product-In-Cart";
import './Cart.css';

export default function Cart() {
    return(
      <div className={'cartContainer'}>
        <ProductInCart size={'Large'} storeName={'Awesome Store'} storeAdress={'Awesome street'} price={20000 +'DKK'} quantity={1} productName={'Jeans that are awesome'}></ProductInCart>
        <ProductInCart size={'Large'} storeName={'Awesome Store'} storeAdress={'Awesome street'} price={20000 +'DKK'} quantity={1} productName={'Jeans that are awesome'}></ProductInCart>
        <ProductInCart size={'Large'} storeName={'Awesome Store'} storeAdress={'Awesome street'} price={20000 +'DKK'} quantity={1} productName={'Jeans that are awesome'}></ProductInCart>
      </div>
    );
}
