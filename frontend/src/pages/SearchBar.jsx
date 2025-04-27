import React from 'react';
import './FrontPage.css'; 

export default function SearchBar() {
    return (
      <div className="search-bar">
        <input type="text" placeholder="Search for products..." />
          <button>Search</button>
      </div>
    );
  }