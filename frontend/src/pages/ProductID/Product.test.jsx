import { render, waitFor, screen } from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom';
import { describe, expect, test } from 'vitest'
import ProductPage from "./Product";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mocking useParams
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useParams: () => ({ id: "123" }),
    };
});

// Mocking useGetVendor
vi.mock("../Profile/useGetVendor.jsx", () => {
    return {
        default: () => [false, { Name: "MockVendor" }],
    };
});

describe("ProductPage", () => {
    beforeEach(() => {
        // This is the test database request, essentialy mocks a database request by giving code 200 then giving required info
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        {
                            ID: 1,
                            Brand: "TestBrand",
                            Name: "Cool Shirt",
                            Description: "A very cool shirt",
                            Price: 299,
                            DiscountProcent: 0,
                            Size: "M",
                            sizeID: 42,
                            Stock: 3,
                            Path: "/test-image.jpg",
                            StoreID: 1,
                        },
                    ]),
            })
        );
    });

    test("renders the product page with all expected elements", async () => {
        render(
            <MemoryRouter initialEntries={["/product/123"]}>
                <Routes>
                    <Route path="/product/:id" element={<ProductPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for product data to load
        await waitFor(() => {
            expect(screen.getByText("TestBrand")).toBeInTheDocument();
        });

        // Checks the expected data
        expect(screen.getByText("Vendor: MockVendor")).toBeInTheDocument();
        expect(screen.getByText("Cool Shirt")).toBeInTheDocument();
        expect(screen.getByText("A very cool shirt")).toBeInTheDocument();
        expect(screen.getByText(/299.00 kr/)).toBeInTheDocument();
        expect(screen.getByLabelText("Size")).toBeInTheDocument();  
        expect(screen.getByLabelText("Quantity")).toBeInTheDocument(); 
        expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
        expect(screen.getByAltText("Product 1")).toBeInTheDocument();
    });
});