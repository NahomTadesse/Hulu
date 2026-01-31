/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigate} from "react-router-dom";

import {deleteProduct, getAllProducts} from "../../lib/api.ts";
import {useEffect, useState} from "react";
import PaginationComponent from "../../lib/PaginationComponent.tsx";
import {Barcode} from "lucide-react";

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        const getProducts = async () => {
            try {
                const productData = await getAllProducts();

                if (productData.status === 200) {
                    setTotalPages(Math.ceil(productData.data.products.length / itemsPerPage));

                    setProducts(
                        productData.data.products.slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                        )
                    );
                }
            } catch (error: any) {
                showMessage(
                    error.response?.data?.message || "Error Getting Products: " + error
                );
            }
        };

        getProducts();
    }, [currentPage]);

    // Delete a product
    const handleDeleteProduct = async (productId: any) => {
        if (window.confirm("Are you sure you want to delete this Product?")) {
            try {
                await deleteProduct(productId);
                showMessage("Product successfully Deleted");
                window.location.reload(); // reload page
            } catch (error: any) {
                showMessage(
                    error.response?.data?.message ||
                    "Error Deleting in a product: " + error
                );
            }
        }
    };

    // Method to show message or errors
    const showMessage = (msg: any) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage("");
        }, 4000);
    };

    return (
        <div className="inventory-container">

            <div className="inventory-header">
                <div>
                    <h1 className="inventory-title">
                        Products
                    </h1>
                    <p className="inventory-subtitle">
                        Product List
                    </p>
                </div>
                <button
                    onClick={() => navigate("/add-product")}
                    className="inventory-add-btn"
                >
                    <Barcode className="w-5 h-5"/>
                    <span>Add Product</span>
                </button>
            </div>

            <div>
                {message && (
                    <div className="mb-4 p-2 bg-green-100 text-green-700 text-center rounded">
                        {message}
                    </div>
                )}

                {products && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-15 bg-gradient-to-b from-teal-50 to-white rounded-xl">

                    {products.map((product: any) => (
                        <div
                            key={product.id}
                            className="bg-white p-6 rounded-xl shadow-2xl w-[100%] transition-all duration-300">


                        <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                                    <p className="text-gray-600">Sku: {product.sku}</p>
                                    <p className="text-gray-600">Price: ${product.price}</p>
                                    <p className="text-gray-600">Quantity: {product.stockQuantity}</p>
                                </div>

                                <div className="flex justify-center mt-6 space-x-3">
                                    <button
                                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200"
                                        onClick={() => navigate(`/edit-product/ETB {product.id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                                        onClick={() => handleDeleteProduct(product.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default ProductPage;