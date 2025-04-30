import {render, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom';
import {CatalogueFilter} from "./Catalogue-Filter";
import {CatalogueSearch} from "./Catalogue-Filter";

describe('CatalogueFilter', () => {
    const filterName = "Category";
    const filterOptions = ["Option 1", "Option 2"];
    const mockOnChange = jest.fn(); // mock function for onChange

    it('renders without crashing', () => {
        const { getByRole } = render(
            <CatalogueFilter
                FilterName={filterName}
                FilterOptions={filterOptions}
                value=""
                onChange={mockOnChange}
            />
        );
        expect(getByRole('combobox')).toBeInTheDocument();
    });

    it('should show passed options in the dropdown menu', () => {
        const {getByRole, getAllByRole} = render(
            <CatalogueFilter
                FilterName='Category'
                FilterOptions={['option1','option2','option3']}
                value=''
                onChange={() => {}}
            />
        )
        const select = getByRole('combobox');
        const options = getAllByRole('option');
        expect(select).toBeInTheDocument();
        expect(options.length).toBe(3)
        expect(options[0].textContent).toBe('option1');
        expect(options[1].textContent).toBe('option2');
        expect(options[2].textContent).toBe('option3');
    });


});