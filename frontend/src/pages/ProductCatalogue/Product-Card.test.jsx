import {render, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom';
import {ProductCard} from "./Product-Card";

describe('ProductCard', () => {

    it('should display product name, storename and price', () => {
        const {getAllByRole, getByRole } = render(
            <ProductCard
                key={1}
                productName={'NameOfProduct'}
                storeName={'NameOfStore'}
                price={500}
            />
        );
        const headings = getAllByRole('heading');

        expect(headings[0]).toHaveTextContent('NameOfStore');
        expect(headings[1]).toHaveTextContent('NameOfProduct');

        const actualPrice = getByRole('paragraph', {name: `500,00 kr`})
        expect(actualPrice).toHaveTextContent(`500,00 kr`);
    });
});