import React from 'react';
import "./Product-Card.css"

function FilterOption({optionName, IsTitle = false}) {
    if(IsTitle){
        return(
            <option value={optionName} hidden={true}>{optionName}</option>
        )
    }
    return(
        <option value={optionName}>{optionName}</option>
    )
}

export function CatalogueFilter({FilterName, FilterOptions}) {
    return (
        <div>
            <label htmlFor="category"></label>
            <select id="category" defaultValue="" className="SortBox">
                <FilterOption optionName={FilterName} IsTitle={true} />
                {FilterOptions.map((option) => (
                    <option value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
}

export function CatalogueSearch(){
    return (
        <div>
            <input type={"text"} placeholder={"Search for products..."} className="SearchBox"/>
        </div>
    )
}