/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTransactionById, updateTransactionStatus } from "../../lib/api.ts";

const TransactionDetailsPage = () => {
    const { transactionId } = useParams();
    const [transaction, setTransaction] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const getTransaction = async () => {
            try {
                const response = await getTransactionById(transactionId);
console.log(response);
                if (response.status === 200) {
                    const transactionData = response.data;
                    setTransaction(transactionData.transaction);
                    setStatus(transactionData.transaction.status);
                }
            } catch (error: any) {
                showMessage(
                    error.response?.data?.message || "Error Getting a transaction: " + error
                );
            }
        };

        getTransaction();
    }, [transactionId]);


    // update transaction status
    const handleUpdateStatus = async () => {
        try {
            await updateTransactionStatus(transactionId, status);
            showMessage("Transaction status updated successfully!");
            // You might want to refresh the data or navigate
            navigate("/transactions");
        } catch (error: any) {
            showMessage(
                error.response?.data?.message || "Error Updating a transaction: " + error
            );
        }
    }


    // Method to show message or errors
    const showMessage = (msg: any) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage("");
        }, 4000);
    };

    // Helper function for status color
    const getStatusColor = (currentStatus: string) => {
        switch (currentStatus) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };


    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
                Transaction Details: #{transactionId}
            </h1>

            {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 text-center rounded-lg font-medium">
                    {message}
                </div>
            )}

            {transaction ? (
                <div className="space-y-8">
                    {/* Transaction Status Update Card (Placed at the top for visibility) */}
                    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
                        <h2 className="text-xl font-bold text-teal-700 mb-4">Update Transaction Status</h2>
                        <div className="flex items-center space-x-4">
                            <label className="text-lg font-medium text-gray-700">New Status:</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                            <button
                                onClick={handleUpdateStatus}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition duration-150 ease-in-out disabled:opacity-50"
                                disabled={status === transaction.status} // Disable if status hasn't changed
                            >
                                Update Status
                            </button>
                        </div>
                    </div>


                    {/* Details Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Transaction base information */}
                        <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction Information</h2>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Type:</strong> <span className="font-medium">{transaction.transactionType}</span></p>
                                <p><strong>Status:</strong>
                                    <span className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                        {transaction.status}
                                    </span>
                                </p>
                                <p><strong>Description:</strong> {transaction.description || 'N/A'}</p>
                                <p><strong>Note:</strong> {transaction.note || 'N/A'}</p>
                                <p><strong>Total Products:</strong> {transaction.totalProducts}</p>
                                <p><strong>Total Price:</strong> <span className="text-green-600 font-semibold">${transaction.totalPrice.toFixed(2)}</span></p>
                                <p><strong>Created At:</strong> {new Date(transaction.createdAt).toLocaleString()}</p>
                                {transaction.updatedAt && (
                                    <p><strong>Updated At:</strong> {new Date(transaction.updatedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>

                        {/* Product information of the transaction */}
                        {transaction.product && (
                            <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Product Information</h2>
                                <div className="space-y-2 text-gray-700">
                                    <p><strong>Name:</strong> {transaction.product.name}</p>
                                    <p><strong>SKU:</strong> {transaction.product.sku}</p>
                                    <p><strong>Price:</strong> ${transaction.product.price.toFixed(2)}</p>
                                    <p><strong>Stock Quantity:</strong> {transaction.product.stockQuantity}</p>
                                    <p><strong>Description:</strong> {transaction.product.description}</p>
                                </div>
                            </div>
                        )}

                        {/* User information who made the transaction */}
                        {transaction.user && (
                            <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">User Information</h2>
                                <div className="space-y-2 text-gray-700">
                                    <p><strong>Name:</strong> {transaction.user.name}</p>
                                    <p><strong>Email:</strong> <a href={`mailto:${transaction.user.email}`} className="text-blue-600 hover:underline">{transaction.user.email}</a></p>
                                    <p><strong>Phone:</strong> {transaction.user.phoneNumber || 'N/A'}</p>
                                    <p><strong>Role:</strong> {transaction.user.role}</p>
                                </div>
                            </div>
                        )}

                        {/* Supplier information who made the transaction */}
                        {transaction.supplier && (
                            <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Supplier Information</h2>
                                <div className="space-y-2 text-gray-700">
                                    <p><strong>Name:</strong> {transaction.supplier.name}</p>
                                    <p><strong>Contact Info:</strong> {transaction.supplier.contactInfo}</p>
                                    <p><strong>Address:</strong> {transaction.supplier.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center p-10 bg-white rounded-lg shadow-md text-gray-500">
                    Loading transaction details...
                </div>
            )}
        </div>
    )
};

export default TransactionDetailsPage;

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useEffect } from "react";
//
// import { useNavigate, useParams } from "react-router-dom";
// import {getTransactionById, updateTransactionStatus} from "../../lib/api.ts";
//
//
//
//
// const TransactionDetailsPage = () => {
//     const { transactionId } = useParams();
//     const [transaction, setTransaction] = useState<any>(null);
//     const [message, setMessage] = useState("");
//     const [status, setStatus] = useState("");
//
//     const navigate = useNavigate();
//
//
//     useEffect(() => {
//         const getTransaction = async () => {
//             try {
//                 const response = await getTransactionById(transactionId);
//
//                 if (response.status === 200) {
//                     const transactionData = response.data;
//                     setTransaction(transactionData.transaction);
//                     setStatus(transactionData.transaction.status);
//                 }
//             } catch (error:any) {
//                 showMessage(
//                     error.response?.data?.message || "Error Getting a transaction: " + error
//                 );
//             }
//         };
//
//         getTransaction();
//     }, [transactionId]);
//
//
// //update transaction status
//     const handleUpdateStatus = async()=>{
//         try {
//            await updateTransactionStatus(transactionId, status);
//             navigate("/transaction")
//         } catch (error:any) {
//             showMessage(
//                 error.response?.data?.message || "Error Updating a transactions: " + error
//             );
//
//         }
//     }
//
//
//     //Method to show message or errors
//     const showMessage = (msg:any) => {
//         setMessage(msg);
//         setTimeout(() => {
//             setMessage("");
//         }, 4000);
//     };
//
//
//
//     return(
//         <div>
//
//             {message && <p className="message">{message}</p>}
//             <div className="transaction-details-page">
//                 {transaction && (
//                     <>
//                         {/* Transaction base information */}
//                         <div className="section-card">
//                             <h2>Transaction Information</h2>
//                             <p>Type: {transaction.transactionType}</p>
//                             <p>Status: {transaction.status}</p>
//                             <p>Description: {transaction.description}</p>
//                             <p>Note: {transaction.note}</p>
//                             <p>Total Products: {transaction.totalProducts}</p>
//                             <p>Total Price: {transaction.totalPrice.toFixed(2)}</p>
//                             <p>Create AT: {new Date(transaction.createdAt).toLocaleString()}</p>
//
//                             {transaction.updatedAt && (
//                                 <p>Updated At: {new Date(transaction.updatedAt).toLocaleString()}</p>
//                             )}
//                         </div>
//
//                         {/* Product information of the transaction */}
//                         <div className="section-card">
//                             <h2>Product Information</h2>
//                             <p>Name: {transaction.product.name}</p>
//                             <p>SKU: {transaction.product.sku}</p>
//                             <p>Price: {transaction.product.price.toFixed(2)}</p>
//                             <p>Stock Quantity: {transaction.product.stockQuantity}</p>
//                             <p>Description: {transaction.product.description}</p>
//
//                             {transaction.product.imageUrl && (
//                                 <img src={transaction.product.imageUrl} alt={transaction.product.name} />
//                             )}
//
//                         </div>
//
//                         {/* User information who made the transaction */}
//                         <div className="section-card">
//                             <h2>User Information</h2>
//                             <p>Name: {transaction.user.name}</p>
//                             <p>Email: {transaction.user.email}</p>
//                             <p>Phone Number: {transaction.user.phoneNumber}</p>
//                             <p>Role: {transaction.user.role}</p>
//                             <p>Create AT: {new Date(transaction.createdAt).toLocaleString()}</p>
//
//                         </div>
//
//
//
//                         {/* Supplier information who made the transaction */}
//                         {transaction.suppliers && (
//                             <div className="section-card">
//                                 <h2>Supplier Information</h2>
//                                 <p>Name: {transaction.supplier.name}</p>
//                                 <p>Contact Address: {transaction.supplier.contactInfo}</p>
//                                 <p>Address: {transaction.supplier.address}</p>
//                             </div>
//                         )}
//
//                         {/* UPDATE TRANSACTION STATUS */}
//                         <div className="section-card transaction-staus-update">
//                             <label>Status: </label>
//                             <select
//                                 value={status}
//                                 onChange={(e)=> setStatus(e.target.value)}
//                             >
//                                 <option value="PENDING">PENDING</option>
//                                 <option value="PROCESSING">PROCESSING</option>
//                                 <option value="COMPLETED">COMPLETED</option>
//                                 <option value="CANCELLED">CANCELLED</option>
//                             </select>
//                             <button onClick={()=>handleUpdateStatus()}>Update Staus</button>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     )
// };
//
// export default TransactionDetailsPage;
