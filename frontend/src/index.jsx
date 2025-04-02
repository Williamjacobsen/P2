import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Header from "./pages/Header";
import NoPage from "./pages/NoPage";
import FrontPage from "./pages/FrontPage";
import Example from "./pages/Example";
import FAQ from "./pages/FAQ";
import Vendor from "./pages/Vendor/Vendor";
import ProductCatalogue from "./pages/ProductCatalogue/Product-Catalogue";
import AddProduct from "./pages/Vendor/Add-Product";
import CustomerProfile from "./pages/Profile/CustomerProfile";
import CustomerSignIn from "./pages/Profile/CustomerSignIn";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Header />}>
          <Route index element={<FrontPage />} />
          <Route path="/example" element={<Example />} />
          <Route path="/FAQ" element={<FAQ />} />
          <Route path="/Product-Catalogue" element={<ProductCatalogue />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/sign-in" element={<CustomerSignIn />} />
        </Route>
        {/* todo: add header to vendor route */}
        <Route path="/vendor" element={<Vendor />} />
        <Route path="/vendor/add-product" element={<AddProduct />} />
        <Route path="*" element={<NoPage />} />
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
