import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store/auth.js";

import { Layout } from "./components/Layout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { FullPageLoader } from "./components/Loader.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import NotFound from "./pages/NotFound.jsx";

import UserHome from "./pages/user/UserHome.jsx";
import Vendors from "./pages/user/Vendors.jsx";
import VendorDetail from "./pages/user/VendorDetail.jsx";
import Items from "./pages/user/Items.jsx";
import Cart from "./pages/user/Cart.jsx";
import Checkout from "./pages/user/Checkout.jsx";
import Orders from "./pages/user/Orders.jsx";
import OrderDetail from "./pages/user/OrderDetail.jsx";
import GuestLists from "./pages/user/GuestLists.jsx";
import GuestListDetail from "./pages/user/GuestListDetail.jsx";
import Requests from "./pages/user/Requests.jsx";
import Profile from "./pages/Profile.jsx";

import VendorHome from "./pages/vendor/VendorHome.jsx";
import MyItems from "./pages/vendor/MyItems.jsx";
import ItemForm from "./pages/vendor/ItemForm.jsx";
import IncomingRequests from "./pages/vendor/IncomingRequests.jsx";
import VendorOrders from "./pages/vendor/VendorOrders.jsx";
import VendorOrderDetail from "./pages/vendor/VendorOrderDetail.jsx";

import AdminHome from "./pages/admin/AdminHome.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminUserForm from "./pages/admin/AdminUserForm.jsx";
import AdminMemberships from "./pages/admin/AdminMemberships.jsx";

export default function App() {
    const { user, accessToken, refreshMe } = useAuth();
    const booting = useAuth((s) => s.booting);

    useEffect(() => {
        // attempt session restore
        if (accessToken || user) refreshMe();
        else useAuth.setState({ booting: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (booting) return <FullPageLoader />;

    return (
        <Routes>
            <Route
                path="/"
                element={
                    user ? (
                        <Navigate to={`/${user.role}`} replace />
                    ) : (
                        <Landing />
                    )
                }
            />
            <Route
                path="/login"
                element={
                    user ? <Navigate to={`/${user.role}`} replace /> : <Login />
                }
            />
            <Route
                path="/signup"
                element={
                    user ? (
                        <Navigate to={`/${user.role}`} replace />
                    ) : (
                        <Signup />
                    )
                }
            />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* USER */}
            <Route
                element={
                    <ProtectedRoute roles={["user"]}>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route path="/user" element={<UserHome />} />
                <Route path="/user/vendors" element={<Vendors />} />
                <Route path="/user/vendors/:id" element={<VendorDetail />} />
                <Route path="/user/items" element={<Items />} />
                <Route path="/user/cart" element={<Cart />} />
                <Route path="/user/checkout" element={<Checkout />} />
                <Route path="/user/orders" element={<Orders />} />
                <Route path="/user/orders/:id" element={<OrderDetail />} />
                <Route path="/user/guest-lists" element={<GuestLists />} />
                <Route
                    path="/user/guest-lists/:id"
                    element={<GuestListDetail />}
                />
                <Route path="/user/requests" element={<Requests />} />
                <Route path="/user/profile" element={<Profile />} />
            </Route>

            {/* VENDOR */}
            <Route
                element={
                    <ProtectedRoute roles={["vendor"]}>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route path="/vendor" element={<VendorHome />} />
                <Route path="/vendor/items" element={<MyItems />} />
                <Route path="/vendor/items/new" element={<ItemForm />} />
                <Route path="/vendor/items/:id/edit" element={<ItemForm />} />
                <Route path="/vendor/requests" element={<IncomingRequests />} />
                <Route path="/vendor/orders" element={<VendorOrders />} />
                <Route
                    path="/vendor/orders/:id"
                    element={<VendorOrderDetail />}
                />
                <Route path="/vendor/profile" element={<Profile />} />
            </Route>

            {/* ADMIN */}
            <Route
                element={
                    <ProtectedRoute roles={["admin"]}>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route path="/admin" element={<AdminHome />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/new" element={<AdminUserForm />} />
                <Route
                    path="/admin/memberships"
                    element={<AdminMemberships />}
                />
                <Route path="/admin/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
