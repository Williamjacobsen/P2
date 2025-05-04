import {render, fireEvent, waitFor, screen} from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom';
import ProductInCart from "./Product-In-Cart";
import {BrowserRouter} from "react-router-dom";
import {expect} from "vitest";

describe('ProductCard', () => {

    it('Should show correct information passed to props', async () => {
        const { getByRole } = render(
            <ProductInCart
                id={1}
                productName={'Heavy T-Shirt'}
                storeName ={'Crazy Store'}
                storeAddress ={'Crazy Street'}
                quantity ={2}
                size ={'Medium'}
                price ={500}
                discount ={59}
            />
        )
        expect(screen.getByText('Heavy T-Shirt')).toBeInTheDocument();
        expect(screen.getByText('Crazy Store')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('205,00 kr')).toBeInTheDocument();
        expect(screen.getByText('-59%')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });
});