import {render, fireEvent, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom';
import ProductCatalogue from "./Product-Catalogue";
import ProductCard from "./Product-Card";
import {BrowserRouter} from "react-router-dom";

describe('ProductCard', () => {

    it('Should filter correctly by gender, price, clothing type, store and search', async () => {

        const MockProducts = [
            {
                ID: 1,
                StoreID: 100,
                Name: "Slim Fit T-Shirt",
                Price: 200,
                DiscountProcent: 10,
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
                DiscountProcent: 20,
                Description: "Big warm hoodie",
                ClothingType: "Hoodies",
                Brand: "BasicWear",
                Gender: "Female",
                StoreName: "Zalando"
            }
        ]
        //mocking fetch request, and returning our made up products
        global.fetch = jest.fn(() =>
            Promise.resolve({
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

        await waitFor(() => screen.getByText(/Product 1/i));


        fireEvent.change(screen.getByLabelText(/Gender/i), {target: {value: "Male"}})
        expect(await screen.queryByText(/Slim Fit T-Shirt/i)).toBeInTheDocument();
        expect(await screen.queryByText(/Oversized Hoodie/i)).not.toBeInTheDocument();
        clearFilter();
        expect(await screen.queryByText(/Slim Fit T-Shirt/i)).toBeInTheDocument();
        expect(await screen.queryByText(/Oversized Hoodie/i)).toBeInTheDocument();


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
        expect(await sortedProducts[0].getByRole('paragraph')).toHaveTextContent("500,00 kr");
        expect(await sortedProducts[1].getByRole('paragraph')).toHaveTextContent("200,00 kr");
        clearFilter();
    });
});