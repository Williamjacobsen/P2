import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "../ProductCatalogue/Product-Card";
import "./Products.css";
import usePages from "../../utils/usePages";

const productsPerPage = 11;

export default function Products({ VendorID }) {
	const [vendorProducts, setVendorProducts] = useState([]);
	const [getVisiblePartOfPageArray, CurrentPageDisplay, PreviousPageButton, NextPageButton] = usePages(vendorProducts, productsPerPage);

	useEffect(() => {
		async function fetchVendorProducts() {
			try {
				const response = await fetch(`http://localhost:3001/VendorProducts/${VendorID}`)
				if (!response.ok) {
					throw new Error("failed to fetch vendor products")
				}
				const data = await response.json();
				setVendorProducts(data);
			}
			catch (err) {
				console.log("failed to fetch vendor products", err)
			}
		}
		fetchVendorProducts();
	}, []);

	return (
		<>
			<div>
				<CurrentPageDisplay />
				<PreviousPageButton />
				<NextPageButton />
			</div>
			<div className="product-grid">
				<AddProductCard />
				{getVisiblePartOfPageArray().map((product) => {
					return (
						<ProductCard
							id={product.ID}
							storeName={product.StoreName}
							productName={product.Name}
							price={product.Price}
							productBrand={product.Brand}
						>
						</ProductCard>
					)
				})}
			</div>
		</>
	);
}

function AddProductCard() {
	const navigate = useNavigate();

	return (
		<div className="addProduct" onClick={() => navigate("/vendor/add-product")}>
			<img className="plusIcon" src="/Img/PlusIcon.png" alt="" />
		</div>
	);
};
