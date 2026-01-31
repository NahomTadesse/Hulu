import { useState, useEffect, useRef } from "react";
import PaginationComponent from "../../lib/PaginationComponent.tsx";
import { getAllTransactions } from "../../lib/api.ts";
import "./report.css"

// ** PDF Dependencies (Install with: npm install jspdf html2canvas)**
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SalesReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("");
    const [valueToSearch, setValueToSearch] = useState("");
    const [_, setAllTransactionsData] = useState([]); // Store all data for searching/filtering

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // ** Ref for PDF target area **
    const reportRef = useRef(null);

    useEffect(() => {
        const getTransactions = async () => {
            try {
                const transactionData = await getAllTransactions();

                if (transactionData.status === 200) {
                    const salesReports = transactionData.data;
                    const allData = salesReports.transactions;

                    // ** Store all data fetched for local filtering/searching **
                    setAllTransactionsData(allData);

                    // ** Apply search logic here based on valueToSearch **
                    const filteredData = valueToSearch
                        ? allData.filter((t: any) =>
                                t.status.toLowerCase().includes(valueToSearch.toLowerCase()) ||
                                t.id.toString().includes(valueToSearch)
                            // Add other fields you want to search
                        )
                        : allData;

                    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));

                    setTransactions(
                        filteredData.slice(
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
    }, [currentPage, valueToSearch]); // Reruns on search or page change

    // Method to show message or errors
    const showMessage = (msg: any) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage("");
        }, 4000);
    };

    // handle search
    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page
        setValueToSearch(filter); // Trigger useEffect
    };

    // ** PDF Generation Function **
    const generatePDF = async () => {
        const input = reportRef.current;
        if (input) {
            showMessage("Generating PDF...");
            // Hide elements we don't want in the PDF (like search/pagination)
            const input = document.getElementById("report-container") as HTMLElement;

            if (input) {
                const elementsToHide = input.querySelectorAll(".transaction-search, .pagination-container");
                elementsToHide.forEach(el => (el as HTMLElement).style.display = "none");

                // ... do export or screenshot logic




            // Wait for the styles to apply
            await new Promise(resolve => setTimeout(resolve, 50));

            // Generate canvas from HTML content
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Handle multi-page content
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Restore hidden elements
            elementsToHide.forEach((el:any) => el.style.display = '');

            pdf.save("sales-report.pdf");
            showMessage("PDF Generated Successfully!");
                elementsToHide.forEach(el => (el as HTMLElement).style.display = "");
            }
        } else {
            showMessage("Error: Could not find report content.");
        }
    };


    return (
        <div className="inventory-container">
            {message && <p className="message">{message}</p>}

            {/* ** Target for PDF generation ** */}
            <div className="transactions-page" ref={reportRef}>
                <div className="transactions-header">
                    <h1>✨ Sales Report</h1>
                    <div className="transaction-controls">
                        <div className="transaction-search">
                            <input
                                placeholder="Search status or ID..."
                                value={filter}
                                onChange={(e)=> setFilter(e.target.value)}
                                type="text"
                            />
                            <button className="search-btn" onClick={handleSearch}> 🔍 Search</button>
                        </div>
                        <button className="export-btn" onClick={generatePDF}> 📄 Export to PDF</button>
                    </div>
                </div>

                {transactions.length > 0 ? (
                    <table className="transactions-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>STATUS</th>
                            <th>TOTAL PRICE</th>
                            <th>TOTAL PRODUCTS</th>
                            <th>DATE</th>
                        </tr>
                        </thead>

                        <tbody>
                        {transactions.map((transaction: any) => (
                            <tr key={transaction.id}>
                                {/* ERROR IS HERE: Ensure ID is a string before calling slice() */}
                                <td>#{String(transaction.id).slice(0, 8)}...</td>
                                <td data-status={transaction.status.toLowerCase()}>
                                    <span className="status-badge">{transaction.status}</span>
                                </td>
                                <td>ETB {transaction.totalPrice.toFixed(2)}</td>
                                <td>{transaction.totalProducts}</td>
                                <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No transactions found matching your criteria.</p>
                )}
            </div>
            {/* ** End PDF Target ** */}

            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};
export default SalesReport;



// import  { useState, useEffect } from "react";
//
// import PaginationComponent from "../../lib/PaginationComponent.tsx";
// import {getAllTransactions}  from "../../lib/api.ts";
//
// const SalesReport = () => {
//     const [transactions, setTransactions] = useState([]);
//     const [message, setMessage] = useState("");
//     const [filter, setFilter] = useState("");
//     const [valueToSearch, setValueToSearch] = useState("");
//
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(0);
//     const itemsPerPage = 10;
//
//     useEffect(() => {
//         const getTransactions = async () => {
//             try {
//                 const transactionData = await getAllTransactions();
//
//                 if (transactionData.status === 200) {
//
//                     const salesReports = transactionData.data;
//
//                     setTotalPages(Math.ceil(salesReports.transactions.length / itemsPerPage));
//
//                     setTransactions(
//                         salesReports.transactions.slice(
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
//     //handle search
//     const handleSearch = () =>{
//         console.log("Searcxh hit")
//         console.log("FILTER IS: " + filter)
//         setCurrentPage(1)
//         setValueToSearch(filter)
//     }
//
//
//     return (
//         <div className="inventory-container">
//
//             {message && <p className="message">{message}</p>}
//             <div className="transactions-page">
//                 <div className="transactions-header">
//                     <h1>Sales Report</h1>
//                     <div className="transaction-search">
//                         <input
//                             placeholder="Search transaction ..."
//                             value={filter}
//                             onChange={(e)=> setFilter(e.target.value)}
//                             type="text" />
//                         <button onClick={()=> handleSearch()} > Search</button>
//                     </div>
//                 </div>
//
//                 {transactions &&
//                     <table className="transactions-table">
//                         <thead>
//                         <tr>
//                             <th>STATUS</th>
//                             <th>TOTAL PRICE</th>
//                             <th>TOTAL PRODUCTS</th>
//                             <th>DATE</th>
//
//                         </tr>
//                         </thead>
//
//                         <tbody>
//                         {transactions.map((transaction:any) => (
//                             <tr key={transaction.id}>
//                                 <td data-status={transaction.status.toLowerCase()}>
//                                     <span className="status-badge">{transaction.status}</span>
//                                 </td>
//                                 <td>ETB {transaction.totalPrice}</td>
//                                 <td>{transaction.totalProducts}</td>
//                                 <td>{new Date(transaction.createdAt).toLocaleString()}</td>
//
//
//                             </tr>
//                         ))}
//                         </tbody>
//                     </table>
//                 }
//             </div>
//
//
//             <PaginationComponent
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={setCurrentPage}
//             />
//         </div>
//     );
// };
// export default SalesReport;
