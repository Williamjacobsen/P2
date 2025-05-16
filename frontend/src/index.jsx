import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Header from "./pages/Header/Header";
import NoPage from "./pages//NoPage";
import FrontPage from "./pages/FrontPage/FrontPage";
import FAQ from "./pages/FAQ/FAQ";
import Vendor from "./pages/Vendor/Vendor";
import Coupons from "./pages/Vendor/Coupons/Coupons";
import ProductCatalogue from "./pages/ProductCatalogue/Product-Catalogue";
import AddProduct from "./pages/Vendor/Add-Product";
import Orders from "./pages/Vendor/Orders";
import Product from "./pages/ProductID/Product";
import Profile from "./pages/Profile/Profile";
import SignIn from "./pages/Profile/SignIn";
import Cart from "./pages/Cart/Cart";
import ProfileProductOrders from "./pages/Profile/ProfileProductOrders";
import ReSignInPopUp from "./pages/Profile/ReSignInPopUp";
import Success from "./pages/SuccessFailure/Success";
import Failure from "./pages/SuccessFailure/Failure";
import EditProduct from "./pages/Vendor/Edit-Product";

export default function App() {
  const [cartAmount, setCartAmount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header cartAmount={cartAmount} setCartAmount={setCartAmount} />
              <ReSignInPopUp />
            </>
          }
        >
          <Route index element={<FrontPage />} />
          <Route path="/FAQ" element={<FAQ />} />
          <Route path="/Product-Catalogue" element={<ProductCatalogue />} />
          <Route
            path="/Product/:id"
            element={<Product setCartAmount={setCartAmount} />}
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route
            path="/Cart"
            element={<Cart setCartAmount={setCartAmount} />}
          />
          <Route
            path="/profile-product-orders"
            element={<ProfileProductOrders />}
          />
          <Route
            path="/success"
            element={<Success setCartAmount={setCartAmount} />}
          />
          <Route path="/cancel" element={<Failure />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/vendor/add-product" element={<AddProduct />} />
          <Route path="/vendor/edit-product/:id" element={<EditProduct />} />
          <Route path="/vendor/orders" element={<Orders />} />
          <Route path="/vendor/coupons" element={<Coupons />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter >
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
