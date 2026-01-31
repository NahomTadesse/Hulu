import { useState, useEffect, useMemo } from "react";
import type { FormEvent } from 'react';
import { getAllProducts, getAllSuppliers, purchaseProduct } from "../../lib/api.ts";
import jsPDF from "jspdf";
import type {Product, Suppliers} from "../Users/data.ts";

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


const PurchasePage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Suppliers[]>([]);
    const [productId, setProductId] = useState("");
    const [supplierId, setSupplierId] = useState("");
    // 💡 NEW STATE for manual Unit Price input
    const [unitPrice, setUnitPrice] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [quantity, setQuantity] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchProductsAndSuppliers = async () => {
            try {
                const productData = (await getAllProducts()) as any;
                const supplierData = (await getAllSuppliers()) as any;
                setProducts(productData?.data?.products || []);
                setSuppliers(supplierData?.data?.suppliers || []);
            } catch (error: any) {
                showMessage(
                    error.response?.data?.message || "Error Getting Data: " + error,
                    'error'
                );
            }
        };

        fetchProductsAndSuppliers();
    }, []);

    // 💡 CALCULATE TOTAL PRICE based on manual inputs
    const totalPrice = useMemo(() => {
        const qty = parseFloat(quantity);
        const price = parseFloat(unitPrice);

        if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
            return null;
        }

        return (qty * price).toFixed(2);
    }, [quantity, unitPrice]);

    // --- PDF Generation Logic (Currency updated to ETB) ---
    const generatePurchaseOrderPDF = (apiResponse: any) => {
        const {transactionResponse, timestamp} = apiResponse;
        const {
            productName,
            supplier,
            quantity,
            unitPrice,
            totalPrice,
            description,
            note,
            createdBy
        } = transactionResponse;

        const doc = new jsPDF('p', 'mm', 'a4');
        let yPos = 20;
        const leftMargin = 15;
        const rightMargin = 195;
        const lineSpacing = 6;
        const tableStartY = 100;

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('PURCHASE INVOICE', leftMargin, yPos);

        const transactionDate = new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice Date: ${transactionDate}`, rightMargin, yPos, {align: 'right'});
        yPos += 15;

        doc.setLineWidth(0.5);
        doc.line(leftMargin, yPos, rightMargin, yPos);
        yPos += 5;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('SUPPLIER', leftMargin, yPos);
        doc.text('PURCHASE DETAILS', 120, yPos);
        yPos += lineSpacing;

        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${supplier}`, leftMargin, yPos);
        doc.text(`Prepared By: ${createdBy}`, 120, yPos);
        yPos += lineSpacing;

        doc.text(`Description: ${description}`, leftMargin, yPos, {maxWidth: 90});
        doc.text(`Note: ${note}`, 120, yPos, {maxWidth: 90});
        yPos += 15;

        yPos = tableStartY;

        doc.setFontSize(10);
        doc.setFillColor(200, 200, 200);
        doc.rect(leftMargin, yPos, rightMargin - leftMargin, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('Product Name', leftMargin + 2, yPos + 6);
        doc.text('Quantity', 100, yPos + 6, {align: 'right'});
        doc.text('Unit Price (ETB)', 135, yPos + 6, {align: 'right'}); // 💡 Currency label update
        doc.text('TOTAL (ETB)', rightMargin - 5, yPos + 6, {align: 'right'}); // 💡 Currency label update
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(productName, leftMargin + 2, yPos + 6);

        const formattedUnitPrice = unitPrice.toFixed(2);

        doc.text(quantity.toString(), 100, yPos + 6, {align: 'right'});
        doc.text(formattedUnitPrice, 135, yPos + 6, {align: 'right'});
        doc.text(totalPrice.toFixed(2), rightMargin - 5, yPos + 6, {align: 'right'});
        yPos += 12;

        doc.setLineWidth(0.2);
        doc.line(leftMargin, yPos, rightMargin, yPos);
        yPos += 5;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL AMOUNT (ETB):', 140, yPos, {align: 'right'}); // 💡 Currency label update
        doc.text(`${totalPrice.toFixed(2)}`, rightMargin - 5, yPos, {align: 'right'});
        yPos += 20;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('The document generated by HULU.', leftMargin, doc.internal.pageSize.height - 15);

        doc.save(`PurchaseInvoice_${transactionDate}.pdf`);
    };

    // --- Submission Logic (Updated to use Unit Price state) ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const qtyValue = parseInt(quantity);
        const priceValue = parseFloat(unitPrice);

        // 💡 Updated Validation Check
        if (!productId || !supplierId || qtyValue <= 0 || priceValue <= 0 || !totalPrice) {
            showMessage("Please fill in all required fields and ensure Quantity and Unit Price are positive.", 'error');
            setIsSubmitting(false);
            return;
        }

        const body = {
            productId,
            quantity: qtyValue,
            supplierId,
            unitPrice: priceValue,
            totalPrice: parseFloat(totalPrice),
            description,
            note,
        };

        try {
            const response = (await purchaseProduct(body)) as any;
            const purchaseProductResponse = response.data;

            if (purchaseProductResponse?.status === 200 || response.status === 200) {
                showMessage(response.data.message || "Purchase completed successfully.", 'success');
                generatePurchaseOrderPDF(purchaseProductResponse);
                resetForm();
            } else {
                showMessage(purchaseProductResponse?.message || "Error processing purchase.", 'error');
            }

        } catch (error: any) {
            showMessage(
                error.response?.data?.message || "Error Purchasing Products: " + error,
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setProductId("");
        setSupplierId("");
        setUnitPrice(""); // 💡 Reset Unit Price
        setDescription("");
        setNote("");
        setQuantity("");
    };

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setMessage(msg);
        setIsError(type === 'error');
        setTimeout(() => {
            setMessage("");
        }, 4000);
    };

    // --- JSX ---
    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* --- HEADER AND ICON --- */}
            <div className="flex items-center mb-6 border-b pb-4">
                <ShoppingCartIcon />
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Process Inventory Purchase
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

            {/* Form Card */}
            <div className="max-w-xl mx-auto bg-white p-8 shadow-xl rounded-xl border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Purchase Order Details</h2>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Product Selection */}
                    <div className="space-y-2">
                        <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
                            Select Product <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="productId"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm disabled:bg-gray-100"
                        >
                            <option value="">-- Select a product --</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Supplier Selection */}
                    <div className="space-y-2">
                        <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">
                            Select Supplier <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="supplierId"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm disabled:bg-gray-100"
                        >
                            <option value="">-- Select a supplier --</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* 💡 Unit Price Input (Manual) */}
                        <div className="space-y-2">
                            <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
                                Unit Cost (ETB) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="unitPrice"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="Enter unit purchase cost"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                required
                                disabled={isSubmitting}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm disabled:bg-gray-100"
                            />
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
                                placeholder="Enter quantity to purchase"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                disabled={isSubmitting}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    {/* 💡 TOTAL PRICE DISPLAY */}
                    <div className="flex justify-end pt-2">
                        <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                            <p className="text-lg font-semibold text-gray-800">
                                Total Purchase Cost:
                                <span className={`ml-3 text-2xl ${totalPrice ? 'text-teal-600' : 'text-gray-400'}`}>
                                    {totalPrice ? `ETB ${totalPrice}` : 'ETB -'}
                                </span>
                            </p>
                            {(!unitPrice || !quantity) && (
                                <p className="text-sm text-red-500 mt-1">
                                    Enter Unit Cost and Quantity to calculate total.
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
                            placeholder="Add a brief description of the purchase"
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm resize-none disabled:bg-gray-100"
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
                            placeholder="Internal notes (e.g., PO reference number)"
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm disabled:bg-gray-100"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 text-lg font-semibold bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition duration-150 ease-in-out disabled:opacity-50 flex justify-center items-center"
                    >
                        {isSubmitting ? "Processing Order..." : "Complete Purchase"}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default PurchasePage;







// import { useState, useEffect, FormEvent } from "react";
// import { getAllProducts, getAllSuppliers, purchaseProduct } from "../../lib/api.ts";
// // Assuming purchase.css is no longer needed if using Tailwind classes
// // import "./purchase.css";
// import jsPDF from "jspdf";
//
// // Reusing the ShoppingCartIcon from the previous SellPage design
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
// const PurchasePage = () => {
//     const [products, setProducts] = useState<any[]>([]);
//     const [suppliers, setSuppliers] = useState<any[]>([]);
//     const [productId, setProductId] = useState("");
//     const [supplierId, setSupplierId] = useState("");
//     const [description, setDescription] = useState("");
//     const [note, setNote] = useState("");
//     const [quantity, setQuantity] = useState("");
//     const [message, setMessage] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//
//     // --- Data Fetching ---
//     useEffect(() => {
//         const fetchProductsAndSuppliers = async () => {
//             try {
//                 const productData = (await getAllProducts()) as any;
//                 const supplierData = (await getAllSuppliers()) as any;
//                 // Safely set state
//                 setProducts(productData?.data?.products || []);
//                 setSuppliers(supplierData?.data?.suppliers || []);
//             } catch (error: any) {
//                 showMessage(
//                     error.response?.data?.message || "Error Getting Data: " + error,
//                     'error'
//                 );
//             }
//         };
//
//         fetchProductsAndSuppliers();
//     }, []);
//
//     // --- PDF Generation Logic (Kept as is) ---
//     const generatePurchaseOrderPDF = (apiResponse: any) => {
//         // ... (PDF logic remains the same)
//         const {transactionResponse, timestamp} = apiResponse;
//         const {
//             productName,
//             supplier,
//             quantity,
//             unitPrice,
//             totalPrice,
//             description,
//             note,
//             createdBy
//         } = transactionResponse;
//
//         const doc = new jsPDF('p', 'mm', 'a4');
//         let yPos = 20;
//         const leftMargin = 15;
//         const rightMargin = 195;
//         const lineSpacing = 6;
//         const tableStartY = 100;
//
//         // Header Section (Title & Date)
//         doc.setFontSize(22);
//         doc.setFont('helvetica', 'bold');
//         doc.text('PURCHASE INVOICE', leftMargin, yPos);
//
//         const transactionDate = new Date(timestamp).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'normal');
//         doc.text(`Invoice Date: ${transactionDate}`, rightMargin, yPos, {align: 'right'});
//         yPos += 15;
//
//         // Supplier & Created By Details
//         doc.setLineWidth(0.5);
//         doc.line(leftMargin, yPos, rightMargin, yPos);
//         yPos += 5;
//
//         doc.setFontSize(11);
//         doc.setFont('helvetica', 'bold');
//         doc.text('SUPPLIER', leftMargin, yPos);
//         doc.text('PURCHASE DETAILS', 120, yPos);
//         yPos += lineSpacing;
//
//         doc.setFont('helvetica', 'normal');
//         doc.text(`Name: ${supplier}`, leftMargin, yPos);
//         doc.text(`Prepared By: ${createdBy}`, 120, yPos);
//         yPos += lineSpacing;
//
//         doc.text(`Description: ${description}`, leftMargin, yPos, {maxWidth: 90});
//         doc.text(`Note: ${note}`, 120, yPos, {maxWidth: 90});
//         yPos += 15;
//
//         // Line Item Table
//         yPos = tableStartY;
//
//         // Table Header
//         doc.setFontSize(10);
//         doc.setFillColor(200, 200, 200);
//         doc.rect(leftMargin, yPos, rightMargin - leftMargin, 8, 'F');
//         doc.setFont('helvetica', 'bold');
//         doc.text('Product Name', leftMargin + 2, yPos + 6);
//         doc.text('Quantity', 100, yPos + 6, {align: 'right'});
//         doc.text('Unit Price', 135, yPos + 6, {align: 'right'});
//         doc.text('TOTAL', rightMargin - 5, yPos + 6, {align: 'right'});
//         yPos += 8;
//
//         // Draw Line Item Data
//         doc.setFont('helvetica', 'normal');
//         doc.text(productName, leftMargin + 2, yPos + 6);
//
//         const formattedUnitPrice = unitPrice.toFixed(2);
//
//         doc.text(quantity.toString(), 100, yPos + 6, {align: 'right'});
//         doc.text(formattedUnitPrice, 135, yPos + 6, {align: 'right'});
//         doc.text(totalPrice.toFixed(2), rightMargin - 5, yPos + 6, {align: 'right'});
//         yPos += 12;
//
//         // Draw final separator line before total
//         doc.setLineWidth(0.2);
//         doc.line(leftMargin, yPos, rightMargin, yPos);
//         yPos += 5;
//
//         // Total Section
//         doc.setFontSize(12);
//         doc.setFont('helvetica', 'bold');
//         doc.text('TOTAL AMOUNT:', 140, yPos, {align: 'right'});
//         doc.text(`${totalPrice.toFixed(2)}`, rightMargin - 5, yPos, {align: 'right'});
//         yPos += 20;
//
//         // Footer/Signature
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'italic');
//         doc.text('The document generated by HULU.', leftMargin, doc.internal.pageSize.height - 15);
//
//         // Save the PDF
//         doc.save(`PurchaseInvoice_${transactionDate}.pdf`);
//     };
//
//     // --- Submission Logic (Kept as is) ---
//     const handleSubmit = async (e: FormEvent) => {
//         e.preventDefault();
//         setIsSubmitting(true);
//
//         if (!productId || !supplierId || !quantity || parseInt(quantity) <= 0) {
//             showMessage("Please select a product, a supplier, and enter a valid quantity.", 'error');
//             setIsSubmitting(false);
//             return;
//         }
//
//         const body = {
//             productId,
//             quantity: parseInt(quantity),
//             supplierId,
//             description,
//             note,
//         };
//
//         try {
//             const response = (await purchaseProduct(body)) as any;
//             const purchaseProductResponse = response.data;
//
//             // Note: status check is dependent on your API response structure.
//             if (purchaseProductResponse?.status === 200 || response.status === 200) {
//                 showMessage(response.data.message || "Purchase completed successfully.", 'success');
//                 generatePurchaseOrderPDF(purchaseProductResponse);
//                 resetForm();
//             } else {
//                 // Handle non-200 but successful-looking API response
//                 showMessage(purchaseProductResponse?.message || "Error processing purchase.", 'error');
//             }
//
//         } catch (error: any) {
//             showMessage(
//                 error.response?.data?.message || "Error Purchasing Products: " + error,
//                 'error'
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
//
//     const resetForm = () => {
//         setProductId("");
//         setSupplierId("");
//         setDescription("");
//         setNote("");
//         setQuantity("");
//     };
//
//     const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
//         setMessage(msg);
//         setIsError(type === 'error'); // Use a dedicated state for error type for styling
//         setTimeout(() => {
//             setMessage("");
//             // Do not clear isError here if you want styling to persist with message
//         }, 4000);
//     };
//
//     // Added a dedicated state for isError styling (needed for the desired look)
//     const [isError, setIsError] = useState(false);
//
//
//     // --- JSX (Styled to look like the Sell Page) ---
//     return (
//         <div className="p-8 bg-gray-50 min-h-screen">
//
//             {/* --- HEADER AND ICON --- */}
//             <div className="flex items-center mb-6 border-b pb-4">
//                 <ShoppingCartIcon /> {/* Icon added here */}
//                 <h1 className="text-3xl font-extrabold text-gray-900">
//                     Process Inventory Purchase
//                 </h1>
//             </div>
//             {/* ----------------------- */}
//
//             {/* Message Display (Styled like the Sell Page) */}
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
//             {/* Form Card (Styled like the Sell Page) */}
//             <div className="max-w-xl mx-auto bg-white p-8 shadow-xl rounded-xl border border-gray-200">
//                 <h2 className="text-2xl font-semibold text-gray-800 mb-6">Purchase Order Details</h2>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//
//                     {/* Product Selection */}
//                     <div className="space-y-2">
//                         <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
//                             Select Product <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             id="productId"
//                             value={productId}
//                             onChange={(e) => setProductId(e.target.value)}
//                             required
//                             disabled={isSubmitting}
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm disabled:bg-gray-100"
//                         >
//                             <option value="">-- Select a product --</option>
//                             {products.map((product) => (
//                                 <option key={product.id} value={product.id}>
//                                     {product.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//
//                     {/* Supplier Selection */}
//                     <div className="space-y-2">
//                         <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">
//                             Select Supplier <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             id="supplierId"
//                             value={supplierId}
//                             onChange={(e) => setSupplierId(e.target.value)}
//                             required
//                             disabled={isSubmitting}
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm disabled:bg-gray-100"
//                         >
//                             <option value="">-- Select a supplier --</option>
//                             {suppliers.map((supplier) => (
//                                 <option key={supplier.id} value={supplier.id}>
//                                     {supplier.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
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
//                             placeholder="Enter quantity to purchase"
//                             value={quantity}
//                             onChange={(e) => setQuantity(e.target.value)}
//                             required
//                             disabled={isSubmitting}
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm disabled:bg-gray-100"
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
//                             placeholder="Add a brief description of the purchase"
//                             disabled={isSubmitting}
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm resize-none disabled:bg-gray-100"
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
//                             placeholder="Internal notes (e.g., PO reference number)"
//                             disabled={isSubmitting}
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm disabled:bg-gray-100"
//                         />
//                     </div>
//
//                     {/* Submit Button */}
//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full px-4 py-3 text-lg font-semibold bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition duration-150 ease-in-out disabled:opacity-50 flex justify-center items-center"
//                     >
//                         {isSubmitting ? "Processing Order..." : "Complete Purchase"}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };
// export default PurchasePage;




















// import { useState, useEffect } from "react";
// import {getAllProducts, getAllSuppliers, purchaseProduct} from "../../lib/api.ts";
// import "./purchase.css";
// import jsPDF from "jspdf";
//
// const PurchasePage = () => {
//     const [products, setProducts] = useState([]);
//     const [suppliers, setSuppliers] = useState([]);
//     const [productId, setProductId] = useState("");
//     const [supplierId, setSupplierId] = useState("");
//     const [description, setDescription] = useState("");
//     const [note, setNote] = useState("");
//     const [quantity, setQuantity] = useState("");
//     const [message, setMessage] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//
//     useEffect(() => {
//         const fetchProductsAndSuppliers = async () => {
//             try {
//                 const productData = (await getAllProducts()) as any;
//                 const supplierData = (await getAllSuppliers()) as any;
//                 setProducts(productData.data.products);
//                 setSuppliers(supplierData.data.suppliers);
//             } catch (error: any) {
//                 showMessage(
//                     error.response?.data?.message || "Error Getting Products: " + error,
//                     'error'
//                 );
//             }
//         };
//
//         fetchProductsAndSuppliers();
//     }, []);
//
//
//     const generatePurchaseOrderPDF = (apiResponse: any) => {
//         // Destructure the transaction data for easier access
//         const {transactionResponse, timestamp} = apiResponse;
//         const {
//             productName,
//             supplier,
//             quantity,
//             unitPrice,
//             totalPrice,
//             description,
//             note,
//             createdBy
//         } = transactionResponse;
//
//         // Initialize PDF document (portrait, mm units, A4 size)
//         const doc = new jsPDF('p', 'mm', 'a4');
//         let yPos = 20;
//         const leftMargin = 15;
//         const rightMargin = 195;
//         const lineSpacing = 6;
//         const tableStartY = 100;
//
//         // --- Header Section (Title & Date) ---
//
//         // Title
//         doc.setFontSize(22);
//         doc.setFont('helvetica', 'bold');
//         doc.text('PURCHASE INVOICE', leftMargin, yPos);
//
//         // Date/Timestamp
//         const transactionDate = new Date(timestamp).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'normal');
//         doc.text(`Invoice Date: ${transactionDate}`, rightMargin, yPos, {align: 'right'});
//         yPos += 15;
//
//         // --- Supplier & Created By Details ---
//
//         // Draw a separator line
//         doc.setLineWidth(0.5);
//         doc.line(leftMargin, yPos, rightMargin, yPos);
//         yPos += 5;
//
//         doc.setFontSize(11);
//         doc.setFont('helvetica', 'bold');
//         doc.text('SUPPLIER', leftMargin, yPos);
//         doc.text('PURCHASE DETAILS', 120, yPos);
//         yPos += lineSpacing;
//
//         doc.setFont('helvetica', 'normal');
//         doc.text(`Name: ${supplier}`, leftMargin, yPos);
//         doc.text(`Prepared By: ${createdBy}`, 120, yPos);
//         yPos += lineSpacing;
//
//         // Note and Description Fields
//         doc.text(`Description: ${description}`, leftMargin, yPos, {maxWidth: 90});
//         doc.text(`Note: ${note}`, 120, yPos, {maxWidth: 90});
//         yPos += 15;
//
//         // --- Line Item Table ---
//         yPos = tableStartY;
//
//         // Table Header
//         doc.setFontSize(10);
//         doc.setFillColor(200, 200, 200); // Light gray background
//         doc.rect(leftMargin, yPos, rightMargin - leftMargin, 8, 'F'); // Header background
//         doc.setFont('helvetica', 'bold');
//         doc.text('Product Name', leftMargin + 2, yPos + 6);
//         doc.text('Quantity', 100, yPos + 6, {align: 'right'});
//         doc.text('Unit Price', 135, yPos + 6, {align: 'right'});
//         doc.text('TOTAL', rightMargin - 5, yPos + 6, {align: 'right'});
//         yPos += 8;
//
//         // Draw Line Item Data
//         doc.setFont('helvetica', 'normal');
//         doc.text(productName, leftMargin + 2, yPos + 6);
//
//         // Format numbers as currency strings
//         const formattedUnitPrice = unitPrice.toFixed(2);
//
//         doc.text(quantity.toString(), 100, yPos + 6, {align: 'right'});
//         doc.text(formattedUnitPrice, 135, yPos + 6, {align: 'right'});
//         doc.text(totalPrice.toFixed(2), rightMargin - 5, yPos + 6, {align: 'right'});
//         yPos += 12;
//
//         // Draw final separator line before total
//         doc.setLineWidth(0.2);
//         doc.line(leftMargin, yPos, rightMargin, yPos);
//         yPos += 5;
//
//         // --- Total Section ---
//         doc.setFontSize(12);
//         doc.setFont('helvetica', 'bold');
//         doc.text('TOTAL AMOUNT:', 140, yPos, {align: 'right'});
//         doc.text(`${totalPrice.toFixed(2)}`, rightMargin - 5, yPos, {align: 'right'});
//         yPos += 20;
//
//         // --- Footer/Signature ---
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'italic');
//         doc.text('The document generated by HULU.', leftMargin, doc.internal.pageSize.height - 15);
//
//         // Save the PDF
//         doc.save(`PurchaseInvoice_${transactionDate}.pdf`);
//     };
//
//
//     // const generatePurchaseOrderPDF = (purchaseDetails: any) => {
//     //     // This is where the PDF generation logic will go.
//     //     // purchaseDetails would contain the product, quantity, supplier info, etc.
//     //     // For now, let's just log a message.
//     //     console.log("Generating PDF for purchase:", purchaseDetails);
//     //     // const doc = new jsPDF();
//     //     // doc.text("Purchase Order Summary", 10, 10);
//     //     // doc.save(`PO-${purchaseDetails.id || 'new'}.pdf`);
//     //     // In a real implementation, you would use jspdf here:
//     //     /*
//     //     const doc = new jsPDF();
//     //     doc.text("Purchase Order Summary", 10, 10);
//     //     // Add product details, supplier info, quantity, etc.
//     //     doc.save(`PO-${purchaseDetails.id || 'new'}.pdf`);
//     //     */
//     //
//     //     // An illustration of what the final PDF might look like:
//     //
//     //
//     //     // let yPosition = 20; // Starting position for items
//     //     // invoiceDetails.items.forEach(item => {
//     //     //     doc.text(`${item.name} x ${item.quantity}`, 10, yPosition);
//     //     //     doc.text(`$${item.price * item.quantity}`, 150, yPosition); // Example price calculation
//     //     //     yPosition += 10; // Move down for the next item
//     //     // });
//     //     //
//     //     // // Add footer information (total cost, tax, etc.)
//     //     // const subtotal = invoiceDetails.items.reduce((acc, current) => acc + current.price * current.quantity, 0);
//     //     // doc.text(`Subtotal: $${subtotal}`, 10, yPosition);
//     //     // const taxRate = 0.08; // Example tax rate
//     //     // const taxAmount = subtotal * taxRate;
//     //     // doc.text(`Tax (${taxRate*100}%): $${taxAmount}`, 10, yPosition + 10);
//     //     // const total = subtotal + taxAmount;
//     //     // doc.text(`Total: $${total}`, 10, yPosition + 20);
//     //     //
//     //     // // Save the PDF
//     //     // doc.save(`Invoice-${invoiceDetails.id || 'new'}.pdf`);
//     //   //  const { jsPDF } = window.jspdf;
//     //     const doc = new jsPDF();
//     //
//     //     doc.setFontSize(16);
//     //     doc.text("Hello! This PDF opened in a new browser tab.", 10, 20);
//     //
//     //     // Open PDF in new browser tab
//     //     const pdfBlob = doc.output("blob");
//     //     const pdfUrl = URL.createObjectURL(pdfBlob);
//     //     window.open(pdfUrl, "_blank");
//     //
//     //
//     // };
//
//     const handleSubmit = async (e: any) => {
//         e.preventDefault();
//         setIsSubmitting(true);
//
//         if (!productId || !supplierId || !quantity) {
//             showMessage("Please fill in all required fields", 'error');
//             setIsSubmitting(false);
//             return;
//         }
//
//         const body = {
//             productId,
//             quantity: parseInt(quantity),
//             supplierId,
//             description,
//             note,
//         };
//
//         try {
//             const response = (await purchaseProduct(body)) as any;
//             console.log(response);
//             const purchaseProductResponse = response.data;
//             if (purchaseProductResponse != null && purchaseProductResponse.status === 200) {
//                 showMessage(response.data.message, 'success');
//
//                 generatePurchaseOrderPDF(purchaseProductResponse)
//
//                 resetForm();
//             } else {
//                 showMessage("Error");
//             }
//
//         } catch (error: any) {
//             showMessage(
//                 error.response?.data?.message || "Error Purchasing Products: " + error,
//                 'error'
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
//
//     const resetForm = () => {
//         setProductId("");
//         setSupplierId("");
//         setDescription("");
//         setNote("");
//         setQuantity("");
//     };
//
//     const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
//         if (type == "success") {
//             setMessage(msg);
//         }
//         setMessage(msg);
//         setTimeout(() => {
//             setMessage("");
//         }, 4000);
//     };
//
//
//     return (
//         <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md">
//
//             {/* Header */}
//             <div className="mb-8">
//                 <h1 className="text-2xl font-semibold text-gray-800">Receive Inventory</h1>
//                 <p className="text-gray-500 mt-1">Add new inventory items to your stock</p>
//             </div>
//
//             {/* Message */}
//             {message && (
//                 <div
//                     className={`p-3 mb-6 text-sm rounded-md ${
//                         message.includes("Error")
//                             ? "bg-red-100 text-red-700 border border-red-300"
//                             : "bg-green-100 text-green-700 border border-green-300"
//                     }`}
//                 >
//                     {message}
//                 </div>
//             )}
//
//             <form onSubmit={handleSubmit} className="space-y-6">
//
//                 {/* Product */}
//                 <div className="flex flex-col">
//                     <label className="text-sm font-medium text-gray-700 mb-1">Select Product *</label>
//                     <select
//                         value={productId}
//                         onChange={(e) => setProductId(e.target.value)}
//                         required
//                         disabled={isSubmitting}
//                         className="h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100"
//                     >
//                         <option value="">Select a product</option>
//                         {products.map((product) => (
//                             <option key={product.id} value={product.id}>
//                                 {product.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//
//                 {/* Supplier */}
//                 <div className="flex flex-col">
//                     <label className="text-sm font-medium text-gray-700 mb-1">Select Supplier *</label>
//                     <select
//                         value={supplierId}
//                         onChange={(e) => setSupplierId(e.target.value)}
//                         required
//                         disabled={isSubmitting}
//                         className="h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100"
//                     >
//                         <option value="">Select a supplier</option>
//                         {suppliers.map((supplier) => (
//                             <option key={supplier.id} value={supplier.id}>
//                                 {supplier.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//
//                 {/* Description */}
//                 <div className="flex flex-col">
//                     <label className="text-sm font-medium text-gray-700 mb-1">Description</label>
//                     <input
//                         type="text"
//                         value={description}
//                         onChange={(e) => setDescription(e.target.value)}
//                         placeholder="Enter product description"
//                         disabled={isSubmitting}
//                         className="h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100"
//                     />
//                 </div>
//
//                 {/* Note */}
//                 <div className="flex flex-col">
//                     <label className="text-sm font-medium text-gray-700 mb-1">Note</label>
//                     <input
//                         type="text"
//                         value={note}
//                         onChange={(e) => setNote(e.target.value)}
//                         placeholder="Additional notes (optional)"
//                         disabled={isSubmitting}
//                         className="h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100"
//                     />
//                 </div>
//
//                 {/* Quantity */}
//                 <div className="flex flex-col">
//                     <label className="text-sm font-medium text-gray-700 mb-1">Quantity *</label>
//                     <input
//                         type="number"
//                         value={quantity}
//                         onChange={(e) => setQuantity(e.target.value)}
//                         required
//                         min="1"
//                         placeholder="Enter quantity"
//                         disabled={isSubmitting}
//                         className="h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100"
//                     />
//                 </div>
//
//                 {/* Submit */}
//                 <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="w-full h-12 bg-teal-600 text-white rounded-lg font-medium text-lg hover:bg-teal-700 transition focus:ring-2 focus:ring-teal-400 disabled:bg-gray-400 flex justify-center items-center"
//                 >
//                     {isSubmitting ? "Processing..." : "Purchase Product"}
//                 </button>
//
//             </form>
//         </div>
//     );
// };
//     export default PurchasePage;
//
// //     return (
// //         <div className="inventory-container">
// //             <div className="inventory-header">
// //                 <div>
// //                     <h1 className="inventory-title">
// //                         Receive Inventory
// //                     </h1>
// //                     <p className="inventory-subtitle">
// //                         Add new inventory items to your stock
// //                     </p>
// //                 </div>
// //             </div>
// //
// //             {message && (
// //                 <div className={`message ${message.includes('Error') ? 'error' : ''}`}>
// //                     {message}
// //                 </div>
// //             )}
// //
// //             <form onSubmit={handleSubmit}>
// //                 <div className="form-group">
// //                     <label>Select Product *</label>
// //                     <select
// //                         value={productId}
// //                         onChange={(e) => setProductId(e.target.value)}
// //                         required
// //                         disabled={isSubmitting}
// //                     >
// //                         <option value="">Select a product</option>
// //                         {products.map((product: any) => (
// //                             <option key={product.id} value={product.id}>
// //                                 {product.name}
// //                             </option>
// //                         ))}
// //                     </select>
// //                 </div>
// //
// //                 <div className="form-group">
// //                     <label>Select Supplier *</label>
// //                     <select
// //                         value={supplierId}
// //                         onChange={(e) => setSupplierId(e.target.value)}
// //                         required
// //                         disabled={isSubmitting}
// //                     >
// //                         <option value="">Select a supplier</option>
// //                         {suppliers.map((supplier: any) => (
// //                             <option key={supplier.id} value={supplier.id}>
// //                                 {supplier.name}
// //                             </option>
// //                         ))}
// //                     </select>
// //                 </div>
// //
// //                 <div className="form-group full-width">
// //                     <label>Description</label>
// //                     <input
// //                         type="text"
// //                         value={description}
// //                         onChange={(e) => setDescription(e.target.value)}
// //                         placeholder="Enter product description"
// //                         disabled={isSubmitting}
// //                     />
// //                 </div>
// //
// //                 <div className="form-group full-width">
// //                     <label>Note</label>
// //                     <input
// //                         type="text"
// //                         value={note}
// //                         onChange={(e) => setNote(e.target.value)}
// //                         placeholder="Additional notes (optional)"
// //                         disabled={isSubmitting}
// //                     />
// //                 </div>
// //
// //                 <div className="form-group">
// //                     <label>Quantity *</label>
// //                     <input
// //                         type="number"
// //                         value={quantity}
// //                         onChange={(e) => setQuantity(e.target.value)}
// //                         required
// //                         min="1"
// //                         placeholder="Enter quantity"
// //                         disabled={isSubmitting}
// //                     />
// //                 </div>
// //
// //                 <button type="submit" disabled={isSubmitting}
// //                         className="bg-teal-600 text-white h-[50px] w-[200px] rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center justify-center">
// //                     {isSubmitting ? "Processing..." : "Purchase Product"}
// //                 </button>
// //             </form>
// //         </div>
// //     );
// // };
//
