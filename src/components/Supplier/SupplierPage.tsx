import  { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import {deleteSupplier, getAllSuppliers} from "../../lib/api.ts";
import {Barcode} from "lucide-react";

const SupplierPage = () => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [_, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const getSuppliers = async () => {
            try {
                const response = await getAllSuppliers() as any;
                if (response.status === 200) {
                    const responseData = response.data;
                    setSuppliers(responseData.suppliers);
                } else {
                    showMessage(response?.message);
                }
            } catch (error:any) {
                showMessage(
                    error.response?.data?.message || "Error Getting Suppliers: " + error
                );
                console.log(error);
            }
        };
        getSuppliers();
    }, []);

    const showMessage = (msg:any) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage("");
        }, 4000);
    };


    const handleDeleteSupplier = async (supplierId:any) => {
        try {
            if (window.confirm("Are you sure you want to delete this supplier? ")) {
                await deleteSupplier(supplierId);
                window.location.reload();
            }
        } catch (error:any) {
            showMessage(
                error.response?.data?.message || "Error Deleting a Suppliers: " + error
            );
        }
    };



    return(

        <div className="inventory-container">
            {/* Header */}
            <div className="inventory-header">
                <div>
                    <h1 className="inventory-title">
                        Suppliers
                    </h1>
                    <p className="inventory-subtitle">
                        Suppliers
                    </p>
                </div>
                <button
                    onClick={() => navigate("/add-supplier")}
                    className="inventory-add-btn"
                >
                    <Barcode className="w-5 h-5"/>
                    <span> Add Supplier</span>
                </button>
            </div>

            {suppliers && (
                <ul className="space-y-2">
                    {suppliers.map((supplier) => (
                        <li className="flex justify-between items-center bg-white p-4 rounded-lg shadow" key={supplier.id}>
                            <span className="font-medium">{supplier.name}</span>

                            <div className="space-x-2">
                                <button onClick={()=> navigate(`/edit-supplier/${supplier.id}`)}
                                        className="text-blue-600 hover:underline"
                                        aria-label="Edit Category"
                                >Edit</button>
                                <button
                                    className="text-red-600 hover:underline"
                                    onClick={()=> handleDeleteSupplier(supplier.id)} >Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>  )

}
export default SupplierPage;
