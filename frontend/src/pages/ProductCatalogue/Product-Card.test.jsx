import {render, fireEvent} from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom';
import ProductCard from "./Product-Card";
import { BrowserRouter } from "react-router-dom";

describe('ProductCard', () => {

    it('should display product name, brand name, storename and price', () => {

        const {getAllByRole, getByText } = render(
            <BrowserRouter>
                <ProductCard
                    id={1}
                    productName="NameOfProduct"
                    storeName="NameOfStore"
                    price={500}
                    productBrand="Brand"
                />
            </BrowserRouter>
        );
        const headings = getAllByRole('heading');

        expect(headings[0]).toHaveTextContent('NameOfStore');
        expect(headings[1]).toHaveTextContent(`Brand - NameOfProduct`);

        expect(getByText('500,00 kr')).toBeInTheDocument();
    });
});