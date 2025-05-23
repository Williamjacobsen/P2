import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Stores() {
  const [shops, setShops] = useState([])

  useEffect(() => {
    const shopCircles = async () => {
      try {
        const response = await fetch("http://localhost:3001/front-page/shop-circles")
        if (!response.ok) {
          throw new Error("Failed To Fetch ShopCircles");
        }
        const data = await response.json();
        setShops(data)
      }
      catch (err) {
        console.log("error fetching shopCircles", err);
      }
    }
    shopCircles();
  }, []);

  return (
    <div className="box-shops">
      {shops.map((shop) => (
        <Link
          to={`/Product-Catalogue?store=${encodeURIComponent(shop.Name)}`}
          key={shop.id}
          className="shop-circle">
          <span>{shop.Name}</span>
        </Link>
      ))}
    </div>
  );
}