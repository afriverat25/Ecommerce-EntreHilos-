import React from "react";
import {BrowserRouter as Router,Routes, Route} from 'react-router-dom';
import Login from "./Login.jsx"; 
import Registration from "./Registration.jsx"
import AdminDashboard  from "./admin/AdminDashboard.jsx";
import AddProductsForm from "./admin/AddProductsForm.jsx";
import ProductsManagement from "./admin/ProductsManagement.jsx";
import CustomerList from "./admin/CustomerList.jsx";
import UserDashboard from "./users/Dashboard.jsx";
import UserProducts from "./users/UserProduct.jsx";
import Cart from "./users/Cart.jsx";
import UserOrders from "./users/UserOrdes.jsx";
import AdminOrders from "./admin/AdminOrders.jsx";
import UserProfile from "./users/UserProfile.jsx";
import LogoutLink from "./Logout.jsx";

export default function RouterPage(){
    return(
        <Router>
            <Routes>
                {/* La ruta de navegación es correcta: el componente Login se muestra en la raíz del sitio */}
                <Route path='/' element={<Login />} /> 
                <Route path='/registration' element={<Registration />} /> 



                <Route path='/user/dashboard' element={<UserDashboard />} /> 
                <Route path='/user/products' element={< UserProducts />} /> 
                <Route path='/user/cart' element={< Cart />} /> 
                <Route path='/user/orders' element={< UserOrders />} /> 
                <Route path='/user/profile' element={< UserProfile />} /> 


                <Route path='/admin/dashboard' element={<AdminDashboard />} /> 
                <Route path='/admin/addProductsForm' element={<AddProductsForm />} /> 
                <Route path='/admin/productsManagement' element={<ProductsManagement />} /> 
                <Route path='/admin/customerList' element={<CustomerList />} /> 
                <Route path='/admin/adminOrders' element={<AdminOrders />} /> 



            </Routes>
        </Router>
    )
}