import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Header from "./pages/Header/Header";
import NoPage from "./pages//NoPage";
import FrontPage from "./pages/FrontPage/FrontPage";
import Example from "./pages/Example";
import FAQ from "./pages/FAQ/FAQ";
import AddFAQPage from "./pages/Vendor/AddFAQPage";
import Vendor from "./pages/Vendor/Vendor";
import ProductCatalogue from "./pages/ProductCatalogue/Product-Catalogue";
import AddProduct from "./pages/Vendor/Add-Product";
import Product from "./pages/ProductID/Product"
import Profile from "./pages/Profile/Profile";
import SignIn from "./pages/Profile/SignIn";
import Cart from "./pages/Cart/Cart";
import ProfileProductOrders from "./pages/Profile/ProfileProductOrders"
import DisplayProductImages from "./DisplayProductImagesExampleForMartin";
import ReSignInPopUp from "./pages/Profile/ReSignInPopUp";
import Success from "./pages/SuccessFailure/Success";
import Failure from "./pages/SuccessFailure/Failure";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Header /><ReSignInPopUp /></>}>
          <Route
            path="/DisplayProductImages"
            element={<DisplayProductImages />}
          />
          <Route index element={<FrontPage />} />
          <Route path="/example" element={<Example />} />
          <Route path="/FAQ" element={<FAQ />} />
          <Route path="/add-faq" element={<AddFAQPage />} />
          <Route path="/Product-Catalogue" element={<ProductCatalogue />} />
          <Route path="/Product/:id" element={<Product />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/profile-product-orders" element={<ProfileProductOrders />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Failure />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/vendor/add-product" element={<AddProduct />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
