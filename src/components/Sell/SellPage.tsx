import { useState, useEffect, useMemo } from "react";
import type { FormEvent } from 'react';
import { getAllProducts, sellProduct } from "../../lib/api.ts";
import type {Product} from "../Users/data.ts";

const ShoppingCartIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 mr-3 text-teal-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);


const SellPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [productId, setProductId] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [quantity, setQuantity] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // 💡 USING THE ACTUAL API CALL
                const productData = (await getAllProducts()) as any;
                // Assuming productData.data.products holds the array of products
                setProducts(productData?.data?.products || []);
            } catch (error: any) {
                showMessage(
                    error.response?.data?.message || "Error Getting Products: " + error,
                    true
                );
            }
        };
        fetchProducts();
    }, []);

    // AUTOMATICALLY SET UNIT PRICE based on product selection
    useEffect(() => {
        const selectedProduct = products.find(p => p.id.toString() === productId);
        if (selectedProduct) {
            // Set the price from the product data, formatted as a string
            // Assuming the product object has a 'price' property
            setUnitPrice(selectedProduct.price.toFixed(2));
        } else {
            setUnitPrice("");
        }
    }, [productId, products]);


    // CALCULATE TOTAL PRICE using useMemo
    const totalPrice = useMemo(() => {
        const qty = parseFloat(quantity);
        const price = parseFloat(unitPrice);

        if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
            return null;
        }

        return (qty * price).toFixed(2);
    }, [quantity, unitPrice]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const qtyValue = parseInt(quantity);
        const priceValue = parseFloat(unitPrice);

        // Validation Check
        if (!productId || qtyValue <= 0 || priceValue <= 0 || !totalPrice) {
            showMessage("Please select a product and enter a valid positive quantity.", true);
            return;
        }

        const body = {
            productId,
            quantity: qtyValue,
            unitPrice: priceValue,
            totalPrice: parseFloat(totalPrice),
            description,
            note,
        };

        try {
            const response = (await sellProduct(body)) as any;
            showMessage(response.data.message, false);
            resetForm();
        } catch (error: any) {
            showMessage(
                error.response?.data?.message || "Error Selling Product: " + error,
                true
            );
        }
    };

    const resetForm = () => {
        setProductId("");
        setUnitPrice("");
        setDescription("");
        setNote("");
        setQuantity("");
    };

    const showMessage = (msg: any, error = false) => {
        setMessage(msg);
        setIsError(error);
        setTimeout(() => {
            setMessage("");
            setIsError(false);
        }, 4000);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* --- HEADER AND ICON --- */}
            <div className="flex items-center mb-6 border-b pb-4">
                <ShoppingCartIcon />
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Process Sale Transaction
                </h1>
            </div>

            {/* Message Display */}
            {message && (
                <div
                    className={`mb-6 p-4 rounded-lg font-medium text-center ${
                        isError
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-green-100 text-green-700 border border-green-300"
                    }`}
                >
                    {message}
                </div>
            )}


            <div className="max-w-xl mx-auto bg-white p-8 shadow-xl rounded-xl border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sell Product Details</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
                            Select Product <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="productId"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                        >
                            <option value="">-- Select a product --</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (SKU: {product.sku}) - ETB {product.price.toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Unit Price DISPLAY (FIXED) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Unit Price (ETB)
                            </label>
                            <div
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 font-semibold"
                            >
                                {unitPrice ? `ETB ${unitPrice}` : 'Select Product'}
                            </div>
                        </div>

                        {/* Quantity Input */}
                        <div className="space-y-2">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                placeholder="Enter quantity to sell"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* TOTAL PRICE DISPLAY */}
                    <div className="flex justify-end pt-2">
                        <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                            <p className="text-lg font-semibold text-gray-800">
                                Total Sale Price:
                                <span className={`ml-3 text-2xl ${totalPrice ? 'text-teal-600' : 'text-gray-400'}`}>
                                    {totalPrice ? `ETB ${totalPrice}` : 'ETB -'}
                                </span>
                            </p>
                            {/* Display helper text only when necessary */}
                            {(!productId || !quantity) && (
                                <p className="text-sm text-red-500 mt-1">
                                    Select a product and enter a quantity to calculate total.
                                </p>
                            )}
                        </div>
                    </div>


                    {/* Description Input */}
                    <div className="space-y-2 pt-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Add a brief description of the sale"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm resize-none"
                        />
                    </div>

                    {/* Note Input */}
                    <div className="space-y-2">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                            Note (Optional)
                        </label>
                        <input
                            id="note"
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Internal notes (e.g., customer name)"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 text-lg font-semibold bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition duration-150 ease-in-out disabled:opacity-50"
                    >
                        Complete Sale
                    </button>
                </form>
            </div>
        </div>
    );
};
export default SellPage;














//
// import { useState, useEffect, useMemo, FormEvent } from "react";
// // Ensure imports for your API functions are correct
// // import { getAllProducts, sellProduct } from "../../lib/api.ts";
//
// // Using a placeholder for API functions and types for clarity
// const getAllProducts = async () => ({ data: { products: [
//             { id: 1, name: "Laptop Pro", sku: "LP-2023", price: 1200.00 },
//             { id: 2, name: "Wireless Mouse", sku: "WM-45", price: 25.50 },
//             { id: 3, name: "Mechanical Keyboard", sku: "MK-900", price: 150.00 },
//         ] } });
// const sellProduct = async (body: any) => ({ data: { message: "Sale processed successfully." } });
//
// const ShoppingCartIcon = () => (
//     <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-8 w-8 mr-3 text-teal-600"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//         strokeWidth={2}
//     >
//         <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//     </svg>
// );
//
//
// const SellPage = () => {
//     const [products, setProducts] = useState<any[]>([]);
//     const [productId, setProductId] = useState("");
//     // 💡 Unit Price is now derived from product selection, but we still need a state to hold it for display/calculation
//     const [unitPrice, setUnitPrice] = useState("");
//     const [description, setDescription] = useState("");
//     const [note, setNote] = useState("");
//     const [quantity, setQuantity] = useState("");
//     const [message, setMessage] = useState("");
//     const [isError, setIsError] = useState(false);
//
//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const productData = (await getAllProducts()) as any;
//                 setProducts(productData?.data?.products || []);
//             } catch (error: any) {
//                 showMessage(
//                     error.response?.data?.message || "Error Getting Products: " + error,
//                     true
//                 );
//             }
//         };
//         fetchProducts();
//     }, []);
//
//     // 💡 AUTOMATICALLY SET UNIT PRICE based on product selection
//     useEffect(() => {
//         const selectedProduct = products.find(p => p.id.toString() === productId);
//         if (selectedProduct) {
//             // Set the price from the product data, formatted as a string
//             setUnitPrice(selectedProduct.price.toFixed(2));
//         } else {
//             // Clear unit price if no product is selected
//             setUnitPrice("");
//         }
//     }, [productId, products]);
//
//
//     // 💡 CALCULATE TOTAL PRICE using useMemo (Logic is the same)
//     const totalPrice = useMemo(() => {
//         const qty = parseFloat(quantity);
//         const price = parseFloat(unitPrice);
//
//         if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
//             return null;
//         }
//
//         return (qty * price).toFixed(2);
//     }, [quantity, unitPrice]);
//
//
//     const handleSubmit = async (e: FormEvent) => {
//         e.preventDefault();
//
//         const qtyValue = parseInt(quantity);
//         const priceValue = parseFloat(unitPrice);
//
//         // Validation Check (Ensuring Unit Price is present, which implies a product was selected)
//         if (!productId || qtyValue <= 0 || priceValue <= 0 || !totalPrice) {
//             showMessage("Please select a product and enter a valid positive quantity.", true);
//             return;
//         }
//
//         const body = {
//             productId,
//             quantity: qtyValue,
//             unitPrice: priceValue, // Sending the derived unitPrice
//             totalPrice: parseFloat(totalPrice), // Sending the calculated totalPrice
//             description,
//             note,
//         };
//
//         try {
//             const response = (await sellProduct(body)) as any;
//             showMessage(response.data.message, false);
//             resetForm();
//         } catch (error: any) {
//             showMessage(
//                 error.response?.data?.message || "Error Selling Product: " + error,
//                 true
//             );
//         }
//     };
//
//     const resetForm = () => {
//         setProductId("");
//         setUnitPrice(""); // Reset Unit Price
//         setDescription("");
//         setNote("");
//         setQuantity("");
//     };
//
//     const showMessage = (msg: any, error = false) => {
//         setMessage(msg);
//         setIsError(error);
//         setTimeout(() => {
//             setMessage("");
//             setIsError(false);
//         }, 4000);
//     };
//
//     return (
//         <div className="p-8 bg-gray-50 min-h-screen">
//
//             {/* --- HEADER AND ICON --- */}
//             <div className="flex items-center mb-6 border-b pb-4">
//                 <ShoppingCartIcon />
//                 <h1 className="text-3xl font-extrabold text-gray-900">
//                     Process Sale Transaction
//                 </h1>
//             </div>
//
//             {/* Message Display */}
//             {message && (
//                 <div
//                     className={`mb-6 p-4 rounded-lg font-medium text-center ${
//                         isError
//                             ? "bg-red-100 text-red-700 border border-red-300"
//                             : "bg-green-100 text-green-700 border border-green-300"
//                     }`}
//                 >
//                     {message}
//                 </div>
//             )}
//
//
//             <div className="max-w-xl mx-auto bg-white p-8 shadow-xl rounded-xl border border-gray-200">
//                 <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sell Product Details</h2>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="space-y-2">
//                         <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
//                             Select Product <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             id="productId"
//                             value={productId}
//                             onChange={(e) => setProductId(e.target.value)}
//                             required
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
//                         >
//                             <option value="">-- Select a product --</option>
//                             {products.map((product) => (
//                                 <option key={product.id} value={product.id}>
//                                     {product.name} (SKU: {product.sku}) - ${product.price.toFixed(2)}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//
//                     <div className="grid grid-cols-2 gap-4">
//                         {/* 💡 Unit Price DISPLAY (NOT EDITABLE INPUT) */}
//                         <div className="space-y-2">
//                             <label className="block text-sm font-medium text-gray-700">
//                                 Unit Price ($)
//                             </label>
//                             <div
//                                 className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 font-semibold"
//                             >
//                                 {unitPrice ? `$${unitPrice}` : 'Select Product'}
//                             </div>
//                         </div>
//
//                         {/* Quantity Input */}
//                         <div className="space-y-2">
//                             <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
//                                 Quantity <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 id="quantity"
//                                 type="number"
//                                 min="1"
//                                 placeholder="Enter quantity to sell"
//                                 value={quantity}
//                                 onChange={(e) => setQuantity(e.target.value)}
//                                 required
//                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
//                             />
//                         </div>
//                     </div>
//
//                     {/* TOTAL PRICE DISPLAY */}
//                     <div className="flex justify-end pt-2">
//                         <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
//                             <p className="text-lg font-semibold text-gray-800">
//                                 Total Sale Price:
//                                 <span className={`ml-3 text-2xl ${totalPrice ? 'text-teal-600' : 'text-gray-400'}`}>
//                                     {totalPrice ? `$${totalPrice}` : '$-'}
//                                 </span>
//                             </p>
//                             {/* Display helper text only when necessary */}
//                             {(!productId || !quantity) && (
//                                 <p className="text-sm text-red-500 mt-1">
//                                     Select a product and enter a quantity to calculate total.
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//
//
//                     {/* Description Input */}
//                     <div className="space-y-2 pt-4">
//                         <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//                             Description (Optional)
//                         </label>
//                         <textarea
//                             id="description"
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             rows={3}
//                             placeholder="Add a brief description of the sale"
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm resize-none"
//                         />
//                     </div>
//
//                     {/* Note Input */}
//                     <div className="space-y-2">
//                         <label htmlFor="note" className="block text-sm font-medium text-gray-700">
//                             Note (Optional)
//                         </label>
//                         <input
//                             id="note"
//                             type="text"
//                             value={note}
//                             onChange={(e) => setNote(e.target.value)}
//                             placeholder="Internal notes (e.g., customer name)"
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
//                         />
//                     </div>
//
//                     {/* Submit Button */}
//                     <button
//                         type="submit"
//                         className="w-full px-4 py-3 text-lg font-semibold bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition duration-150 ease-in-out disabled:opacity-50"
//                     >
//                         Complete Sale
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };
// export default SellPage;


























// import { useState, useEffect, useMemo, FormEvent } from "react";
// Ensure imports for your API functions are correct
// import { getAllProducts, sellProduct } from "../../lib/api.ts";

// Using a placeholder for API functions and types for clarity
// const getAllProducts = async () => ({ data: { products: [] } });
// const sellProduct = async (body: any) => ({ data: { message: "Sale processed successfully." } });
//
// const ShoppingCartIcon = () => (
//     <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-8 w-8 mr-3 text-teal-600"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//         strokeWidth={2}
//     >
//         <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//     </svg>
// );
//
//
// const SellPage = () => {
//     // Note: 'products' type should match what your API returns
//     const [products, setProducts] = useState<any[]>([]);
//     const [productId, setProductId] = useState("");
//     const [unitPrice, setUnitPrice] = useState("");
//     const [description, setDescription] = useState("");
//     const [note, setNote] = useState("");
//     const [quantity, setQuantity] = useState("");
//     const [message, setMessage] = useState("");
//     const [isError, setIsError] = useState(false);
//
//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 // Ensure getAllProducts returns data in the expected format
//                 const productData = (await getAllProducts()) as any;
//                 // Using a safe fallback
//                 setProducts(productData?.data?.products || []);
//             } catch (error: any) {
//                 showMessage(
//                     error.response?.data?.message || "Error Getting Products: " + error,
//                     true
//                 );
//             }
//         };
//
//         fetchProducts();
//     }, []);
//
//     // 💡 1. CALCULATE TOTAL PRICE using useMemo
//     const totalPrice = useMemo(() => {
//         const qty = parseFloat(quantity);
//         const price = parseFloat(unitPrice);
//
//         // Return 0 or null if inputs are invalid/missing
//         if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
//             return null;
//         }
//
//         // Calculate and format to 2 decimal places
//         return (qty * price).toFixed(2);
//     }, [quantity, unitPrice]);
//
//
//     const handleSubmit = async (e: FormEvent) => {
//         e.preventDefault();
//
//         const qtyValue = parseInt(quantity);
//         const priceValue = parseFloat(unitPrice);
//
//         // 💡 Validation Check (Updated)
//         if (!productId || qtyValue <= 0 || priceValue <= 0 || !totalPrice) {
//             showMessage("Please select a product and enter valid positive values for Quantity and Unit Price.", true);
//             return;
//         }
//
//         // NOTE: unitPrice is not included in the 'body' for the API call
//         // in your original code, but you should typically send it if
//         // it determines the sale value. I'll add it here for completeness.
//         const body = {
//             productId,
//             quantity: qtyValue,
//             unitPrice: priceValue, // Added unitPrice to the payload
//             totalPrice: parseFloat(totalPrice), // Added totalPrice to the payload
//             description,
//             note,
//         };
//
//         try {
//             const response = (await sellProduct(body)) as any;
//             showMessage(response.data.message, false);
//             resetForm();
//         } catch (error: any) {
//             showMessage(
//                 error.response?.data?.message || "Error Selling Product: " + error,
//                 true
//             );
//         }
//     };
//
//     const resetForm = () => {
//         setProductId("");
//         setUnitPrice(""); // Reset Unit Price
//         setDescription("");
//         setNote("");
//         setQuantity("");
//     };
//
//     const showMessage = (msg: any, error = false) => {
//         setMessage(msg);
//         setIsError(error);
//         setTimeout(() => {
//             setMessage("");
//             setIsError(false);
//         }, 4000);
//     };
//
//     return (
//         <div className="p-8 bg-gray-50 min-h-screen">
//
//             {/* --- HEADER AND ICON --- */}
//             <div className="flex items-center mb-6 border-b pb-4">
//                 <ShoppingCartIcon />
//                 <h1 className="text-3xl font-extrabold text-gray-900">
//                     Process Sale Transaction
//                 </h1>
//             </div>
//
//             {/* Message Display */}
//             {message && (
//                 <div
//                     className={`mb-6 p-4 rounded-lg font-medium text-center ${
//                         isError
//                             ? "bg-red-100 text-red-700 border border-red-300"
//                             : "bg-green-100 text-green-700 border border-green-300"
//                     }`}
//                 >
//                     {message}
//                 </div>
//             )}
//
//
//             <div className="max-w-xl mx-auto bg-white p-8 shadow-xl rounded-xl border border-gray-200">
//                 <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sell Product Details</h2>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="space-y-2">
//                         <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
//                             Select Product <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             id="productId"
//                             value={productId}
//                             onChange={(e) => setProductId(e.target.value)}
//                             required
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
//                         >
//                             <option value="">-- Select a product --</option>
//                             {products.map((product) => (
//                                 <option key={product.id} value={product.id}>
//                                     {product.name} (SKU: {product.sku})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//
//                     <div className="grid grid-cols-2 gap-4">
//                         {/* 💡 2. Unit Price (Manual Input) */}
//                         <div className="space-y-2">
//                             <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
//                                 Unit Price ($) <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 id="unitPrice"
//                                 type="number"
//                                 min="0.01"
//                                 step="0.01"
//                                 placeholder="Enter unit selling price"
//                                 value={unitPrice}
//                                 onChange={(e) => setUnitPrice(e.target.value)}
//                                 required
//                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
//                             />
//                         </div>
//
//                         {/* Quantity Input */}
//                         <div className="space-y-2">
//                             <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
//                                 Quantity <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 id="quantity"
//                                 type="number"
//                                 min="1"
//                                 placeholder="Enter quantity to sell"
//                                 value={quantity}
//                                 onChange={(e) => setQuantity(e.target.value)}
//                                 required
//                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
//                             />
//                         </div>
//                     </div>
//
//                     {/* 💡 TOTAL PRICE DISPLAY */}
//                     <div className="flex justify-end pt-2">
//                         <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
//                             <p className="text-lg font-semibold text-gray-800">
//                                 Total Sale Price:
//                                 <span className={`ml-3 text-2xl ${totalPrice ? 'text-teal-600' : 'text-gray-400'}`}>
//                                     {totalPrice ? `$${totalPrice}` : '$-'}
//                                 </span>
//                             </p>
//                             {totalPrice === null && (
//                                 <p className="text-sm text-red-500 mt-1">
//                                     Enter Quantity and Unit Price to calculate total.
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//
//
//                     {/* Description Input */}
//                     <div className="space-y-2 pt-4"> {/* Added pt-4 for spacing */}
//                         <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//                             Description (Optional)
//                         </label>
//                         <textarea
//                             id="description"
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             rows={3}
//                             placeholder="Add a brief description of the sale"
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm resize-none"
//                         />
//                     </div>
//
//                     {/* Note Input */}
//                     <div className="space-y-2">
//                         <label htmlFor="note" className="block text-sm font-medium text-gray-700">
//                             Note (Optional)
//                         </label>
//                         <input
//                             id="note"
//                             type="text"
//                             value={note}
//                             onChange={(e) => setNote(e.target.value)}
//                             placeholder="Internal notes (e.g., customer name)"
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
//                         />
//                     </div>
//
//                     {/* Submit Button */}
//                     <button
//                         type="submit"
//                         className="w-full px-4 py-3 text-lg font-semibold bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition duration-150 ease-in-out disabled:opacity-50"
//                     >
//                         Complete Sale
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };
// export default SellPage;










































//
// import { useState, useEffect } from "react";
// import { getAllProducts, sellProduct } from "../../lib/api.ts";
//
// const ShoppingCartIcon = () => (
//     <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-8 w-8 mr-3 text-teal-600"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//         strokeWidth={2}
//     >
//         <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//     </svg>
// );
//
//
// const SellPage = () => {
//     const [products, setProducts] = useState([]);
//     const [productId, setProductId] = useState("");
//     const [unitPrice, setUnitPrice] = useState("");
//     const [description, setDescription] = useState("");
//     const [note, setNote] = useState("");
//     const [quantity, setQuantity] = useState("");
//     const [message, setMessage] = useState("");
//     const [isError, setIsError] = useState(false);
//
//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const productData = (await getAllProducts()) as any;
//                 setProducts(productData.data.products || []);
//             } catch (error: any) {
//                 showMessage(
//                     error.response?.data?.message || "Error Getting Products: " + error,
//                     true
//                 );
//             }
//         };
//
//         fetchProducts();
//     }, []);
//
//     const handleSubmit = async (e: any) => {
//         e.preventDefault();
//
//         if (!productId || !quantity || parseInt(quantity) <= 0) {
//             showMessage("Please select a product and enter a valid quantity.", true);
//             return;
//         }
//
//         const body = {
//             productId,
//             quantity: parseInt(quantity),
//             description,
//             note,
//         };
//
//         try {
//             const response = (await sellProduct(body)) as any;
//             showMessage(response.data.message, false);
//             resetForm();
//         } catch (error: any) {
//             showMessage(
//                 error.response?.data?.message || "Error Selling Product: " + error,
//                 true
//             );
//         }
//     };
//
//     const resetForm = () => {
//         setProductId("");
//         setDescription("");
//         setNote("");
//         setQuantity("");
//     };
//
//     const showMessage = (msg: any, error = false) => {
//         setMessage(msg);
//         setIsError(error);
//         setTimeout(() => {
//             setMessage("");
//             setIsError(false);
//         }, 4000);
//     };
//
//     return (
//         <div className="p-8 bg-gray-50 min-h-screen">
//
//             {/* --- HEADER AND ICON --- */}
//             <div className="flex items-center mb-6 border-b pb-4">
//                 <ShoppingCartIcon /> {/* Icon added here */}
//                 <h1 className="text-3xl font-extrabold text-gray-900">
//                     Process Sale Transaction
//                 </h1>
//             </div>
//             {/* ----------------------- */}
//
//             {/* Message Display */}
//             {message && (
//                 <div
//                     className={`mb-6 p-4 rounded-lg font-medium text-center ${
//                         isError
//                             ? "bg-red-100 text-red-700 border border-red-300"
//                             : "bg-green-100 text-green-700 border border-green-300"
//                     }`}
//                 >
//                     {message}
//                 </div>
//             )}
//
//
//             <div className="max-w-xl mx-auto bg-white p-8 shadow-xl rounded-xl border border-gray-200">
//                 <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sell Product Details</h2>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="space-y-2">
//                         <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
//                             Select Product <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             id="productId"
//                             value={productId}
//                             onChange={(e) => setProductId(e.target.value)}
//                             required
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
//                         >
//                             <option value="">-- Select a product --</option>
//                             {products.map((product: any) => (
//                                 <option key={product.id} value={product.id}>
//                                     {product.name} (SKU: {product.sku})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//
//                     <div className="space-y-2">
//                         <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
//                             Unit Price ($) <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             id="unitPrice"
//                             type="number"
//                             min="0.01"
//                             step="0.01"
//                             placeholder="Enter unit selling price"
//                             value={unitPrice}
//                             onChange={(e) => setUnitPrice(e.target.value)}
//                             required
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
//                         />
//                     </div>
//
//
//
//                     {/* Quantity Input */}
//                     <div className="space-y-2">
//                         <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
//                             Quantity <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             id="quantity"
//                             type="number"
//                             min="1"
//                             placeholder="Enter quantity to sell"
//                             value={quantity}
//                             onChange={(e) => setQuantity(e.target.value)}
//                             required
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
//                         />
//                     </div>
//
//                     {/* Description Input */}
//                     <div className="space-y-2">
//                         <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//                             Description (Optional)
//                         </label>
//                         <textarea
//                             id="description"
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             rows={3}
//                             placeholder="Add a brief description of the sale"
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm resize-none"
//                         />
//                     </div>
//
//                     {/* Note Input */}
//                     <div className="space-y-2">
//                         <label htmlFor="note" className="block text-sm font-medium text-gray-700">
//                             Note (Optional)
//                         </label>
//                         <input
//                             id="note"
//                             type="text"
//                             value={note}
//                             onChange={(e) => setNote(e.target.value)}
//                             placeholder="Internal notes (e.g., customer name)"
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
//                         />
//                     </div>
//
//                     {/* Submit Button */}
//                     <button
//                         type="submit"
//                         className="w-full px-4 py-3 text-lg font-semibold bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition duration-150 ease-in-out disabled:opacity-50"
//                     >
//                         Complete Sale
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };
// export default SellPage;