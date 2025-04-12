import React, {useState} from "react";
import ProductInCart from "./Product-In-Cart";
import './Cart.css';
import CheckoutCard from "./Checkout-Card";
export default function Cart() {
    const [cartProducts, setCartProdcuts] = useState('')

    //simply calculates the sum price of all the products in the cart
    function calculateTotalPrice(products){
        if (products.length === 0){
            return 0;
        }

        let sum = 0;
        for (const product of products) {
            sum += product.Price;
        }
        return sum;
    }

    return(
        <div className={'cartPage'}>
            <div className={'cartContainer'}>
                <ProductInCart size={'Large'} storeName={'Awesome Store'} storeAdress={'Awesome street'} price={20000 +'DKK'} quantity={1} productName={'Jeans that are awesome'}></ProductInCart>
                <ProductInCart size={'Large'} storeName={'Awesome Store'} storeAdress={'Awesome street'} price={20000 +'DKK'} quantity={1} productName={'Jeans that are awesome'}></ProductInCart>
                <ProductInCart size={'Large'} storeName={'Awesome Store'} storeAdress={'Awesome street'} price={20000 +'DKK'} quantity={1} productName={'Jeans that are awesome'}></ProductInCart>
            </div>
            <CheckoutCard price={calculateTotalPrice(cartProducts)}></CheckoutCard>
        </div>
    );
}
