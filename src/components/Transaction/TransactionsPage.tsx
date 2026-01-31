/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTransactions } from "../../lib/api.ts";
import PaginationComponent from "../../lib/PaginationComponent.tsx";

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("");
    const [valueToSearch, setValueToSearch] = useState("");

    const navigate = useNavigate();

    // Pagination Set-Up
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        const getTransactions = async () => {
            try {
                // Fetch all transactions data
                const response = await getAllTransactions();

                if (response.status === 200) {
                    const transactionData = response.data;

                    // Assuming transactionData.transactions contains ALL transactions for total page calculation
                    const totalTransactionsCount = transactionData.transactions.length;
                    setTotalPages(Math.ceil(totalTransactionsCount / itemsPerPage));

                    // Apply pagination slice
                    setTransactions(
                        transactionData.transactions.slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                        )
                    );
                }
            } catch (error: any) {
                showMessage(
                    error.response?.data?.message || "Error Getting transactions: " + error
                );
            }
        };

        getTransactions();
    }, [currentPage, valueToSearch]);

    // Method to show message or errors
    const showMessage = (msg: any) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage("");
        }, 4000);
    };

    // Handle search
    const handleSearch = () => {
        console.log("Search hit");
        console.log("FILTER IS: " + filter);
        setCurrentPage(1);
        setValueToSearch(filter);
    };

    // Navigate to transactions details page
    const navigateToTransactionDetailsPage = (transactionId: any) => {
        navigate(`/transaction/${transactionId}`);
    };

    return (
        <div className="p-6"> {/* Added padding to the main container */}
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    🧾 Transactions Overview
                </h1>
                <p className="text-lg text-gray-500">
                    Manage and view all financial transactions.
                </p>
            </div>
            {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 text-center rounded-lg font-medium">
                    {message}
                </div>
            )}

            {/* Search Bar and Actions */}
            <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-md">
                <h1 className="text-xl font-semibold text-teal-700">Transaction List</h1>
                <div className="flex items-center space-x-3">
                    <input
                        placeholder="Search transaction..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        type="text"
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
                    />
                    <button
                        onClick={() => handleSearch()}
                        // Improved button style
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition duration-150 ease-in-out"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-teal-600 text-white"> {/* Consistent header style */}
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">TYPE</th>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">STATUS</th>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">TOTAL PRICE</th>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">TOTAL PRODUCTS</th>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">DATE</th>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">ACTIONS</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction: any) => (
                            <tr
                                key={transaction?.id}
                                // Added alternating row colors for better readability
                                className="hover:bg-teal-50 transition-colors odd:bg-gray-50"
                            >
                                <td className="p-4 whitespace-nowrap text-sm text-gray-900">{transaction.transactionType}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                                    {/* Dynamic status badge (optional, but good practice) */}
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                    }`}>
                                            {transaction.status}
                                        </span>
                                </td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-900">${transaction.totalPrice.toFixed(2)}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-900 text-center">{transaction.totalProducts}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(transaction.createdAt).toLocaleString()}
                                </td>
                                <td className="p-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() =>
                                            navigateToTransactionDetailsPage(transaction?.id)
                                        }
                                        // Improved 'View Details' button style
                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 ease-in-out"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-10 bg-white rounded-lg shadow-md text-gray-500">
                    No transactions found.
                </div>
            )}

            {/* Pagination Component */}
            <div className="mt-6 flex justify-center">
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};
export default TransactionsPage;











// /* eslint-disable @typescript-eslint/no-explicit-any */
// import  { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {getAllTransactions} from "../../lib/api.ts";
// import PaginationComponent from "../../lib/PaginationComponent.tsx";
//
// const TransactionsPage = () => {
//     const [transactions, setTransactions] = useState([]);
//     const [message, setMessage] = useState("");
//     const [filter, setFilter] = useState("");
//     const [valueToSearch, setValueToSearch] = useState("");
//
//     const navigate = useNavigate();
//
//     // Pagination Set-Up
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(0);
//     const itemsPerPage = 10;
//
//     useEffect(() => {
//         const getTransactions = async () => {
//             try {
//                 const response = await getAllTransactions();
//
//                 if (response.status === 200) {
//                    const transactionData = response.data;
//                     setTotalPages(Math.ceil(transactionData.transactions.length / itemsPerPage));
//
//                     setTransactions(
//                         transactionData.transactions.slice(
//                             (currentPage - 1) * itemsPerPage,
//                             currentPage * itemsPerPage
//                         )
//                     );
//                 }
//             } catch (error:any) {
//                 showMessage(
//                     error.response?.data?.message || "Error Getting transactions: " + error
//                 );
//             }
//         };
//
//         getTransactions();
//     }, [currentPage, valueToSearch]);
//
//     // Method to show message or errors
//     const showMessage = (msg:any) => {
//         setMessage(msg);
//         setTimeout(() => {
//             setMessage("");
//         }, 4000);
//     };
//
//     // Handle search
//     const handleSearch = () => {
//         console.log("Search hit");
//         console.log("FILTER IS: " + filter);
//         setCurrentPage(1);
//         setValueToSearch(filter);
//     };
//
//     // Navigate to transactions details page
//     const navigateToTransactionDetailsPage = (transactionId:any) => {
//         navigate(`/transaction/${transactionId}`);
//     };
//
//     return (
//         <div className="inventory-container">
//             <div className="inventory-header">
//                 <div>
//                     <h1 className="inventory-title">
//                         Transactions
//                     </h1>
//                     <p className="inventory-subtitle">
//                         Transactions
//                     </p>
//                 </div>
//             </div>
//             {message && (
//                 <div className="mb-4 p-3 bg-green-100 text-green-700 text-center rounded-lg">
//                     {message}
//                 </div>
//             )}
//             <div className="inventory-container mt-4">
//                 <div className="flex justify-between items-center mb-6">
//                     <h1 className="text-2xl font-bold text-teal-700"></h1>
//                     <div className="flex items-center space-x-2">
//                         <input
//                             placeholder="Search transaction ..."
//                             value={filter}
//                             onChange={(e) => setFilter(e.target.value)}
//                             type="text"
//                             className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                         />
//                         <button
//                             onClick={() => handleSearch()}
//                             className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500"
//                         >
//                             Search
//                         </button>
//                     </div>
//                 </div>
//
//                 {transactions && (
//                     <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
//                         <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500">
//                         <tr>
//                             <th className="p-3 text-left">TYPE</th>
//                             <th className="p-3 text-left">STATUS</th>
//                             <th className="p-3 text-left">TOTAL PRICE</th>
//                             <th className="p-3 text-left">TOTAL PRODUCTS</th>
//                             <th className="p-3 text-left">DATE</th>
//                             <th className="p-3 text-left">ACTIONS</th>
//                         </tr>
//                         </thead>
//                         <tbody>
//                         {transactions.map((transaction:any) => (
//                             <tr
//                                 key={transaction?.id}
//                                 className="border-b hover:bg-gray-100 transition-colors"
//                             >
//                                 <td className="p-3">{transaction.transactionType}</td>
//                                 <td className="p-3">{transaction.status}</td>
//                                 <td className="p-3">{transaction.totalPrice}</td>
//                                 <td className="p-3">{transaction.totalProducts}</td>
//                                 <td className="p-3">
//                                     {new Date(transaction.createdAt).toLocaleString()}
//                                 </td>
//                                 <td className="p-3">
//                                     <button
//                                         onClick={() =>
//                                             navigateToTransactionDetailsPage(transaction?.id)
//                                         }
//                                         className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500"
//                                     >
//                                         View Details
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//
//             <PaginationComponent
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={setCurrentPage}
//             />
//         </div>
//     );
// };
// export default TransactionsPage;