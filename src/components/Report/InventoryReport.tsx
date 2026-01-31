import  { useState, useEffect, useRef } from "react";
import PaginationComponent from "../../lib/PaginationComponent.tsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {geInventoryReport} from "../../lib/api.ts";
import "./report.css";

const InventoryReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("");
    const [valueToSearch, setValueToSearch] = useState("");



    // ** Ref for PDF target area **
    const reportRef = useRef(null);

    //Pagination Set-Up
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        const getTransactions = async () => {
            try {
                // Assuming ApiService.geInventoryReport handles the search filter (valueToSearch)
                const transactionData = (await geInventoryReport()) as any;
                if (transactionData.status == 200) {
                    const response = transactionData.data;
                    setTotalPages(Math.ceil(response.length / itemsPerPage));

                    setTransactions(
                        response.slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                        )
                    );
                }
            } catch (error:any) {
                // Ensure proper error handling, checking if response and data exist
                showMessage(
                    error.response?.data?.message || "Error Getting inventory data: " + error.message
                );
            }
        };

        getTransactions();
    }, [currentPage, valueToSearch]);



    //Method to show message or errors
    const showMessage = (msg:any) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage("");
        }, 4000);
    };


    //handle search
    const handleSearch = () =>{
        setCurrentPage(1) // Reset to first page
        setValueToSearch(filter) // Trigger useEffect
    }

    // ** PDF Generation Function **
    const generatePDF = async () => {
        const input = reportRef.current;
        if (input) {
            showMessage("Generating PDF...");


            const input = document.getElementById("report-container") as HTMLElement;

            if (input) {
                const elementsToHide = input.querySelectorAll(".transaction-search, .pagination-container");
                elementsToHide.forEach(el => (el as HTMLElement).style.display = "none");

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

                [...elementsToHide].forEach(el => {
                    (el as HTMLElement).style.display = "";
                });

                pdf.save("inventory-report.pdf");
                showMessage("PDF Generated Successfully!");

                elementsToHide.forEach(el => (el as HTMLElement).style.display = "");
            }




        } else {
            showMessage("Error: Could not find report content.");
        }
    };
    const toTitleCase = (str: string) => {
        return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
    };

    return (
        <div className="inventory-container">
            {message && <p className="message">{message}</p>}

            {/* ** Target for PDF generation ** */}
            <div className="transactions-page" ref={reportRef}>
                <div className="transactions-header">
                    <h1>📊 Inventory Report</h1>
                    <div className="transaction-controls">
                        <div className="transaction-search">
                            <input
                                placeholder="Search by name or category..."
                                value={filter}
                                onChange={(e)=> setFilter(e.target.value)}
                                type="text" />
                            <button className="search-btn" onClick={handleSearch}> 🔍 Search</button>
                        </div>
                        <button className="export-btn" onClick={generatePDF}> 📄 Export to PDF</button>
                    </div>
                </div>

                {transactions.length > 0 ? (
                    <table className="transactions-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Stock Quantity</th>
                            <th>Retail Price</th>
                            <th>Category Name</th>
                            <th>Location</th>
                        </tr>
                        </thead>

                        <tbody>
                        {transactions.map((product:any) => (
                            // Use product.id as key, assuming it exists on inventory items
                            <tr key={product.id}>
                                <td>{toTitleCase(product.name)}</td>
                                <td><span className="stock-qty">{product.stockQuantity}</span> Units</td>
                                <td>ETB {(product.price * 1.2).toFixed(2)}</td> {/* Assuming 'price' is the base price */}
                                <td> {product.categoryName}</td>
                                <td>{product.location}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No inventory items found.</p>
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
export default InventoryReport;