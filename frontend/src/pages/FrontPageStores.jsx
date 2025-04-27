import React from 'react';
import { Link } from 'react-router-dom';
import './FrontPage.css'; 

const shopCircles = [
  { id: 1, image: '/Img/HM-Share-Image.jpg', label: 'H&M', link: '/shop-1' },
  { id: 2, image: '/images/shop2.jpg', label: 'Shop 2', link: '/shop-2' },
  { id: 3, image: '/images/shop3.jpg', label: 'Shop 3', link: '/shop-3' },
  { id: 4, image: '/images/shop4.jpg', label: 'Shop 4', link: '/shop-4' },
  { id: 5, image: '/images/shop5.jpg', label: 'Shop 5', link: '/shop-5' },
  { id: 6, image: '/images/shop6.jpg', label: 'Shop 6', link: '/shop-6' },
  { id: 7, image: '/images/shop7.jpg', label: 'Shop 7', link: '/shop-7' },
  { id: 8, image: '/images/shop8.jpg', label: 'Shop 8', link: '/shop-8' },
  { id: 9, image: '/images/shop9.jpg', label: 'Shop 9', link: '/shop-9' },
  { id: 10, image: '/images/shop10.jpg', label: 'Shop 10', link: '/shop-10' },
  { id: 11, image: '/images/shop11.jpg', label: 'Shop 11', link: '/shop-11' },
  { id: 12, image: '/images/shop12.jpg', label: 'Shop 12', link: '/shop-12' },
  { id: 13, image: '/images/shop13.jpg', label: 'Shop 13', link: '/shop-13' },
  { id: 14, image: '/images/shop14.jpg', label: 'Shop 14', link: '/shop-14' },
  { id: 15, image: '/images/shop15.jpg', label: 'Shop 15', link: '/shop-15' },
  { id: 16, image: '/images/shop16.jpg', label: 'Shop 16', link: '/shop-16' }, 
];

export default function BoxShop() {
  return (
    <div className="box-shops">
      {shopCircles.map((shop) => (
        <Link to={shop.link} key={shop.id} className="shop-circle">
          <img src={shop.image} />
          <span>{shop.label}</span>
        </Link>
      ))}
    </div>
  );
}