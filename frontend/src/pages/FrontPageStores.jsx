import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import './FrontPage.css';

export default function BoxShop() {
  const [shops, setShops] = useState([])

  useEffect(() => {
    const shopCircles = async () => {
      try {
        const response = await fetch("http://localhost:3001/shopCircles")
        if (!response.ok){
          throw new Error("Failed To Fetch ShopCircles");
        }
        const data = await response.json();
        setShops(data)
      }
      catch (err){
        console.log("error fetching shopCircles", err);
      }
    }
    shopCircles();
  },[]);

  return (
    <div className="box-shops">
      {shops.map((shop) => (
        <Link to={shop.link} key={shop.id} className="shop-circle">
          {/*
          <img src={shop.image} />
          */}
          <span>{shop.Name}</span>
        </Link>
      ))}
    </div>
  );
}