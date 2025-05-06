import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import { useCart } from "./CartContext";  
import ProductInCart from "./Product-In-Cart";
import "./Cart.css";
import CheckoutCard from "./Checkout-Card";
import { deleteCookie, getAllCookieProducts } from "../../utils/cookies";
import handleCheckout from "./handleCheckout";
import useGetProfile from "../Profile/useGetProfile";
import { AmountOfItemsInCart } from "../../utils/AmountOfItemsInCart";

export default function Cart( {setCartAmount}) {

  const [cartProducts, setCartProducts] = useState([]);
  const [cookieProducts, setCookieProducts] = useState([]);
  //const { removeFromCart } = useCart();

  useEffect(() => {
    setCookieProducts(getAllCookieProducts());
  }, []);

  useEffect(() => {
    async function fetchAllProductData() {
      try {
        const products = await Promise.all(
          cookieProducts.map((product) =>
            fetch(`http://localhost:3001/product/${product.id}`)
              .then((res) => res.json())
              .then((data) => {
                const dbProduct = data[0];
                //ok so, we grab product info from the database with fetch which gives us an array with a single object in it
                //the reason for that is SQL returns rows even if there is just one match for the query
                //then we extract the single object from the array the db gives back with data[0],
                //then we take the database object and use spread operator to create a new object with all the same info,
                //but with the size and quantity from the cookie added onto it aswell
                return {
                  ...dbProduct,
                  size: product.size,
                  quantity: product.quantity,
                };
              })
          )
        );
        setCartProducts(products);
      } catch (err) {
        console.log("failed to fetch products for cart", err);
      }
    }
    fetchAllProductData();
  }, [cookieProducts]);

  // Hooks
  const navigate = useNavigate();
  const [isLoadingProfile, profile] = useGetProfile();

  // Is the user signed in?
  if (isLoadingProfile) {
    return <>Loading login...</>;
  }

  //simply calculates the sum price of all the products in the cart
  function calculateTotalPrice(products) {
    if (products.length === 0) {
      return 0;
    }

    let sum = 0;
    for (const product of products) {
      sum += (product.Price -(product.Price * product.DiscountProcent) / 100) * product.quantity;
    }
    return sum;
  }
/*
  const handleRemoveItem = (productId) => {
    // Remove from context
    removeFromCart(productId);
    // Remove from cookies
    deleteCookie(`Product-${productId}`, "/");
    // Update local state
    setCookieProducts(getAllCookieProducts());
  };
*/
  return (
    <div className={"cartPage"}>
      <div className={"cartContainer"}>
        {cartProducts.map((product) => {
          return (
            <ProductInCart
              id={product.ID}
              storeName={product.StoreName}
              price={product.Price}
              productName={`${product.Brand} - ${product.Name}`}
              storeAddress={product.StoreAddress}
              quantity={product.quantity}
              size={product.size}
              discount={product.DiscountProcent}
              removeFunction={() => {
                deleteCookie(`Product-${product.ID}`, "/");
                //we reload the cookies now that one has been deleted.
                setCookieProducts(getAllCookieProducts());
                
                setCartAmount(AmountOfItemsInCart());
              }}
            />
          );
        })}
      </div>
      <CheckoutCard
        price={calculateTotalPrice(cartProducts)}
        PaymentFunction={() => {
          if (profile === undefined) {
            navigate("/sign-in");
          } else {
            handleCheckout(cartProducts);
          }
        }}
      />
    </div>
  );
}
