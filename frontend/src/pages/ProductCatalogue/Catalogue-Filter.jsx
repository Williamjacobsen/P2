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

export function CatalogueFilter({FilterName, FilterOptions, value, onChange}) {
    return (
        <div>
            <label htmlFor={FilterName}></label>
            <select
                id="category"
                defaultValue=""
                className="SortBox"
                value = {value}
                onChange={onChange}>
                <FilterOption optionName={FilterName} IsTitle={true} />
                {FilterOptions.map((option) => (
                    <option value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
}

export function CatalogueSearch({value, onChange}){
    return (
        <div>
            <input type={"text"} placeholder={"Search for products..."} className="SearchBox" value={value} onChange={onChange}/>
        </div>
    )
}