import {render, fireEvent, waitFor, screen} from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom';
import ProductCatalogue from "./Product-Catalogue";
import {BrowserRouter} from "react-router-dom";


describe('ProductCard', () => {

    it('Should filter correctly by gender, price, clothing type, store and search', async () => {

        const MockProducts = [
            {
                ID: 1,
                StoreID: 100,
                Name: "Slim Fit T-Shirt",
                Price: 200,
                DiscountProcent: 0,
                Description: "Comfortable cotton t-shirt",
                ClothingType: "T-shirts",
                Brand: "BasicWear",
                Gender: "Male",
                StoreName: "Zara"
            },
            {
                ID: 2,
                StoreID: 1,
                Name: "Oversized Hoodie",
                Price: 500,
                DiscountProcent: 0,
                Description: "Big warm hoodie",
                ClothingType: "Hoodies",
                Brand: "BasicWear",
                Gender: "Female",
                StoreName: "Zalando"
            }
        ]
        //mocking fetch request, and returning our made up products
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(MockProducts),
            })
        );

        const {getAllByRole, getByRole } = render(
            <BrowserRouter>
                <ProductCatalogue/>
            </BrowserRouter>
        );

        function clearFilter(){
            const clearButton = getByRole('button', { name: /❌/i });
            fireEvent.click(clearButton);
        }

        fireEvent.change(screen.getByLabelText(/Gender/i), {target: {value: "Male"}})
        await waitFor(() =>{
            expect( getByRole('heading', { name: /BasicWear - Slim Fit T-Shirt/i })).toBeInTheDocument();
        });
        await waitFor(() =>{
        expect( screen.queryByText(/BasicWear - Oversized Hoodie/i)).not.toBeInTheDocument();
        });
        clearFilter();
        expect( screen.queryByText(/Slim Fit T-Shirt/i)).toBeInTheDocument();
        expect( screen.queryByText(/Oversized Hoodie/i)).toBeInTheDocument();


        fireEvent.change(screen.getByLabelText(/Product Type/i), {target: {value: "Hoodies"}});
        expect(await screen.queryByText(/Slim Fit T-Shirt/i)).not.toBeInTheDocument();
        expect(await screen.queryByText(/Oversized Hoodie/i)).toBeInTheDocument();
        clearFilter();
        expect(await screen.queryByText(/Slim Fit T-Shirt/i)).toBeInTheDocument();
        expect(await screen.queryByText(/Oversized Hoodie/i)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/Store/i), {target: {value: "Zalando"}});
        expect(await screen.queryByText(/Slim Fit T-Shirt/i)).not.toBeInTheDocument();
        expect(await screen.queryByText(/Oversized Hoodie/i)).toBeInTheDocument();
        clearFilter();
        expect(await screen.queryByText(/Slim Fit T-Shirt/i)).toBeInTheDocument();
        expect(await screen.queryByText(/Oversized Hoodie/i)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/Price/i), {target: {value: "Highest Price"}});
        const sortedProducts = getAllByRole("product-card");
        expect(sortedProducts[0].querySelector('p')).toHaveTextContent("500,00 kr");
        expect(sortedProducts[1].querySelector('p')).toHaveTextContent("200,00 kr");
        clearFilter();
    });
});