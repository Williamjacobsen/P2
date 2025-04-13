import React from "react";
import './FrontPage.css';

const FrontPage = () => {
  return (
    <section>
    <div className="background">
    <div className="content">
      <h1>Aalborg <span>Clothing Shops</span></h1>
      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius earum animi eveniet perspiciatis numquam nobis possimus nihil molestias itaque, quae quidem facilis maiores ducimus adipisci nulla voluptate dolore laboriosam. Nisi?.</p>
      <div class="buttons">
        <button className="primary-btn">Shop Now</button>
        <button className="secondary-btn">View Collection</button>
      </div>
      <div className="search-bar">
      <input type="text" placeholder="Search for products..." />
      <button>Search</button>
    </div>
    </div>
  </div>
   <div className="fp-products">
    </div>
    </section>
  );
};

export default FrontPage;