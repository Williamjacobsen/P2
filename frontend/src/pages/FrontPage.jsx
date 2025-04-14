import React from "react";
import { useNavigate } from "react-router-dom";
import './FrontPage.css';

const FrontPage = () => {
  const navigate = useNavigate();
    
      return (
      <section>
        <div className="background">
        <div className="content">
        <h1>Aalborg <span>Clothing Shops</span></h1>
        <p>Lorem ipsum, dolor sit amet consectetur... </p>
          
        <div className="buttons">
        <button 
          className="primary-btn" 
          onClick={() => navigate('/Product-Catalogue')}> Shop Now</button>
        <button 
          className="secondary-btn" 
          onClick={() => navigate('/')}>View Profile</button>
        </div>

        <div className="search-bar">
        <input type="text" placeholder="Search for products..." />
        <button>Search</button>
        </div>
        </div>
        </div>
        <div className="fp-products"></div>
        </section>
      );
    };
    
export default FrontPage;