import React from 'react';
import './Product-In-Cart.css';

function ProductInCart({id, storeName, storeAdress, quantity, size, productName, price, imgURL}) {
    return (
        <div className={'cartProduct'}>
            <img src={imgURL} className={'cartImg'} alt={''}></img>
            <div className={'cartText'}>
                <h1>{storeName}</h1>
                <h2>{storeAdress}</h2>
                <p>{productName}</p>
                <p>{size}</p>
                <h1>{price}</h1>
                <h1>{quantity}</h1>
            </div>
            <div className={'cartRemove'}>
                <button className={'cartRemoveButton'}>Remove</button>
            </div>
        </div>
    );
}

export default ProductInCart;