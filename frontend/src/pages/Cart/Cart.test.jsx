import {render, screen, waitFor} from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom';
import {expect} from "vitest";
import CheckoutCard from "./Checkout-Card";
import Cart from "./Cart";
import {BrowserRouter} from "react-router-dom";

describe('ProductCard', () => {

    it('Should show correct price', async () => {

        vi.mock("../../utils/cookies", () => ({
            getAllCookieProducts: () => [
                { id: 1, size: 'Medium', quantity: 2 }
            ],
        }));
        vi.mock('../Profile/useGetProfile', () => ({
            default: () => [false, { name: 'Test User' }], // not loading, user is signed in
        }));

        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([
                    {
                        ID: 1,
                        StoreID: 1,
                        Name: "Black Boots",
                        Price: 1000,
                        DiscountProcent: 10,
                        Description: "Big black cool boots",
                        ClothingType: "Footwear",
                        Brand: "CowboyBoots",
                        Gender: "Male",
                        StoreName: "UrbanTrendz",
                        Path: null,
                        Address: "Nørrebrogade 21, Copenhagen",
                    },
                ]),
            })
        );


        const {  } = render(
            <BrowserRouter>
                <Cart/>
            </BrowserRouter>
        )
        await waitFor(() =>{
            expect(screen.getByText('900.00 kr')).toBeInTheDocument();
        });
        expect(screen.getByText('CowboyBoots - Black Boots')).toBeInTheDocument();
        expect(screen.getByText('Nørrebrogade 21, Copenhagen')).toBeInTheDocument();
        expect(screen.getByText('UrbanTrendz')).toBeInTheDocument();
        expect(screen.getByText('-10%')).toBeInTheDocument();
        expect(screen.getByText('1800.00 kr')).toBeInTheDocument();
        expect(screen.getByText('CLICK-AND-COLLECT')).toBeInTheDocument();
    });
});