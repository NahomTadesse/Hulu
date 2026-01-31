import {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {addSupplier, getSupplierById, updateSupplier} from "../../lib/api.ts";

const AddEditSupplierPage = () => {
    const {supplierId} = useParams();
    const [name, setName] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [address, setAddress] = useState("");
    const [message, setMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (supplierId) {
            setIsEditing(true);

            const fetchSupplier = async () => {
                try {
                    const response = await getSupplierById(supplierId);
                    if (response.status === 200) {
                        const supplierData = response.data;
                        setName(supplierData.supplier.name);
                        setContactInfo(supplierData.supplier.contactInfo);
                        setAddress(supplierData.supplier.address);
                    }
                } catch (error: any) {
                    showMessage(
                        error.response?.data?.message ||
                        "Error Getting a Supplier by Id: " + error
                    );
                }
            };
            fetchSupplier();
        }
    }, [supplierId]);

    // Handle form submission for both add and edit supplier
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const supplierData = {name, contactInfo, address};

        try {
            if (isEditing) {
                await updateSupplier(supplierId, supplierData);
                showMessage("Supplier Edited successfully");
                navigate("/supplier");
            } else {
                await addSupplier(supplierData);
                showMessage("Supplier Added successfully");
                navigate("/supplier");
            }
        } catch (error: any) {
            showMessage(
                error.response?.data?.message ||
                "Error Getting a Supplier by Id: " + error
            );
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
        // Main container: Centers content, adds padding, and uses a light background
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">

            {/* Header Section */}
            <div className="w-full max-w-lg mb-8 text-center">
                <div>
                    {/* Title: Large, bold, and uses a primary color */}
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        {isEditing ? "Edit Supplier" : "Add New Supplier"}
                    </h1>
                    {/* Subtitle: Muted text */}
                    <p className="mt-2 text-sm text-gray-500">
                        Manage your suppliers below.
                    </p>
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <div className="w-full max-w-lg mb-6 p-4 bg-green-100 text-green-800 text-center rounded-lg shadow-md border border-green-300">
                    {message}
                </div>
            )}

            {/* Form Card Container: White background, rounded corners, shadow, and padding */}
            <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-200">

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Supplier Name Field */}
                    <div>
                        <label
                            htmlFor="supplier-name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Supplier Name
                        </label>
                        <input
                            id="supplier-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            type="text"
                            // Input Styling: Focus ring, smooth borders, and good padding
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                            placeholder="e.g., HULU PLC."
                        />
                    </div>

                    {/* Contact Info Field */}
                    <div>
                        <label
                            htmlFor="contact-info"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Contact Info
                        </label>
                        <input
                            id="contact-info"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            required
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                            placeholder="e.g., (09/07) 00000000 or email"
                        />
                    </div>

                    {/* Address Field */}
                    <div>
                        <label
                            htmlFor="address"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Address
                        </label>
                        <input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                            placeholder="e.g., Region, City, Sub City , Woreda"
                        />
                    </div>

                    {/* Submit Button (Full width and centered at the bottom) */}
                    {/* Removed the problematic 'absolute' positioning from the original button container */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                        >
                            {isEditing ? "Save Changes" : "Add Supplier"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
    export default AddEditSupplierPage;

    // return (
    //     <div className="inventory-container">
    //         <div className="inventory-header">
    //             <div>
    //                 <h1 className="inventory-title">
    //                     {isEditing ? "Edit Supplier" : "Add New Supplier"}
    //                 </h1>
    //                 <p className="inventory-subtitle">
    //                     Manage your Supplier below
    //                 </p>
    //             </div>
    //
    //         </div>
    //         {message && (
    //             <div className="mb-4 p-3 bg-green-100 text-green-700 text-center rounded-lg">
    //                 {message}
    //             </div>
    //         )}
    //
    //         <div className="inventory-form-card">
    //
    //             <form onSubmit={handleSubmit} className="space-y-4">
    //                 <div>
    //                     <label className="block text-gray-700 font-semibold mb-2">
    //                         Supplier Name
    //                     </label>
    //                     <input
    //                         value={name}
    //                         onChange={(e) => setName(e.target.value)}
    //                         required
    //                         type="text"
    //                         className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
    //                     />
    //                 </div>
    //
    //                 <div>
    //                     <label className="block text-gray-700 font-semibold mb-2">
    //                         Contact Info
    //                     </label>
    //                     <input
    //                         value={contactInfo}
    //                         onChange={(e) => setContactInfo(e.target.value)}
    //                         required
    //                         type="text"
    //                         className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
    //                     />
    //                 </div>
    //
    //                 <div>
    //                     <label className="block text-gray-700 font-semibold mb-2">
    //                         Address
    //                     </label>
    //                     <input
    //                         value={address}
    //                         onChange={(e) => setAddress(e.target.value)}
    //                         required
    //                         type="text"
    //                         className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
    //                     />
    //                 </div>
    //
    //                 <div className="absolute bottom-[210px] right-33">
    //                     <button
    //                         type="submit"
    //                         className="bg-teal-600 text-white h-[50px] w-[200px] rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center justify-center"
    //                     >
    //                         {isEditing ? "Edit Supplier" : "Add Supplier"}
    //                     </button>
    //                 </div>
    //             </form>
    //         </div>
    //     </div>
    // );
// };

