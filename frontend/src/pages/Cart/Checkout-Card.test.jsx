import {render, screen} from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom';
import {expect} from "vitest";
import CheckoutCard from "./Checkout-Card";

describe('ProductCard', () => {

    it('Should show correct price', async () => {
        const {  } = render(
            <CheckoutCard
                price={'205'}

            />
        )
        expect(screen.getByText('205,00 kr')).toBeInTheDocument();
    });
});