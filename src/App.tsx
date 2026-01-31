import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";


import { CategoryPage } from "./components/Category/CategoryPage";
import ProductPage from "./components/Product/ProductPage";
import SupplierPage from "./components/Supplier/SupplierPage";
import AddEditSupplierPage from "./components/Supplier/AddEditSupplierPage";
import TransactionsPage from "./components/Transaction/TransactionsPage";
import TransactionDetailsPage from "./components/Transaction/TransactionDetailsPage";
import { AddEditProductPage } from "./components/Product/AddEditProductPage";
import PurchasePage from "./components/Purchase/PurchasePage";
import SellPage from "./components/Sell/SellPage";
import SalesReport from "./components/Report/SalesReport";
import InventoryReport from "./components/Report/InventoryReport";
import LoginPage from "./components/Login/LoginPage";

import { ProtectedRoute } from "./security/ProtectedRoute";
import { AuthProvider } from "./security/AuthContext";
import Dashboard from "./components/Dashboard/Dashboard.tsx";
import ManageUsersPage from "./components/Users/ManageUsersPage.tsx";
import ManageRolesPage from "./components/Users/ManageRolesPage.tsx";
import UnauthorizedPage from "./components/Unauthorized/Unauthorized.tsx";
function AppLayout() {
    const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState("dashboard");
    const location = useLocation();

    // Check if current route is /login
    const isLoginPage = location.pathname === "/login";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
            {!isLoginPage ? (
                <div className="flex h-screen overflow-hidden">
                    <Sidebar
                        collapsed={sideBarCollapsed}
                        onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Header
                            sideBarCollapsed={sideBarCollapsed}
                            onToggleSideBar={() => setSideBarCollapsed(!sideBarCollapsed)}
                        />
                        <main className="flex-1 overflow-y-auto bg-white dark:bg-white">
                            <div className="p-6 space-y-6">
                                <AppRoutes />
                            </div>
                        </main>
                    </div>
                </div>
            ) : (
                // For the login page, render only the page itself — no sidebar or header
                <div className="flex items-center justify-center h-screen bg-gray-50">
                    <AppRoutes />
                </div>
            )}
        </div>
    );
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/product" element={<ProtectedRoute><ProductPage /></ProtectedRoute>} />
            <Route path="/productCategory" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
            <Route path="/supplier" element={<ProtectedRoute><SupplierPage /></ProtectedRoute>} />
            <Route path="/add-product" element={<ProtectedRoute><AddEditProductPage /></ProtectedRoute>} />
            <Route path="/edit-product/:productId" element={<ProtectedRoute><AddEditProductPage /></ProtectedRoute>} />
            <Route path="/add-supplier" element={<ProtectedRoute><AddEditSupplierPage /></ProtectedRoute>} />
            <Route path="/purchase" element={<ProtectedRoute><PurchasePage /></ProtectedRoute>} />
            <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
            <Route path="/salesReport" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
            <Route path="/inventoryReport" element={<ProtectedRoute><InventoryReport /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/edit-supplier/:supplierId" element={<ProtectedRoute><AddEditSupplierPage /></ProtectedRoute>} />
            <Route path="/transaction/:transactionId" element={<ProtectedRoute><TransactionDetailsPage /></ProtectedRoute>} />
            <Route path="/manage-user" element={<ProtectedRoute><ManageUsersPage /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><ManageRolesPage /></ProtectedRoute>} />
             <Route path="/unauthorized" element={<UnauthorizedPage />} />

        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppLayout />
            </Router>
        </AuthProvider>
    );
}
