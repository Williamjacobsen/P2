import { getAllCookieProducts } from "./cookies";

export function AmountOfItemsInCart() {
    // get all cookies
    const cookies = getAllCookieProducts();
    
    // go trough every cookie product and count by quantity
    
    let SumOfProductInCart = 0;

    for (let product of cookies) {  
        //Tilføj quantity til variabel
        SumOfProductInCart += product.quantity;
    }

    return SumOfProductInCart
}