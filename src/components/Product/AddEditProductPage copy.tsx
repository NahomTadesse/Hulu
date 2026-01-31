/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {addProduct, getAllCategory, getProductById, updateProduct} from "../../lib/api.ts";

const AddEditProductPage = () => {
    const {productId} = useParams();
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [price, setPrice] = useState("");
    const [stockQuantity, setStockQuantity] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    // const [imageFile, setImageFile] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [_, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await getAllCategory();
                setCategories(categoriesData.data.categories);
            } catch (error:any) {
                showMessage(
                    error.response?.data?.message ||
                    "Error Getting all Categories: " + error
                );
            }
        };

        const fetchProductById = async () => {
            if (productId) {
                setIsEditing(true);
                try {
                    const response = await getProductById(productId) as  any;
                    if (response.status === 200) {
                        const productData = response.data.product;
                        setName(productData.name);
                        setSku(productData.sku);
                        setPrice(productData.price);
                        setStockQuantity(productData.stockQuantity);
                        setCategoryId(productData.categoryId);
                        setDescription(productData.description);

                    } else {
                        showMessage(response.message);
                    }
                } catch (error:any) {
                    showMessage(
                        error.response?.data?.message ||
                        "Error Getting a Product by Id: " + error
                    );
                }
            }
        };

        fetchCategories();
        if (productId) fetchProductById();
    }, [productId]);

    const showMessage = (msg:any) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage("");
        }, 4000);
    };

    // const handleImageChange = (e:any) => {
    //     const file = e.target.files[0];
    //     setImageFile(file);
    //     const reader = new FileReader();
    //     reader.onloadend = () => setImageUrl(reader.result);
    //     reader.readAsDataURL(file);
    // };

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("sku", sku);
        formData.append("price", price);
        formData.append("stockQuantity", stockQuantity);
        formData.append("categoryId", categoryId);
        formData.append("description", description);
        // if (imageFile) {
        //     formData.append("imageFile", imageFile);
      //  }

        try {
            if (isEditing) {
                formData.append("productId", productId as string);
                await updateProduct(formData);
                showMessage("Product successfully updated");
            } else {
                await addProduct(formData);
                showMessage("Product successfully Saved 🤩");
            }
            navigate("/product");
        } catch (error:any) {
            showMessage(
                error.response?.data?.message || "Error Saving a Product: " + error
            );
        }
    };

    return (
        <div>
            <div className="min-h-screen p-6 bg-gray-100 flex ">
                <div className="w-full p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Add Product</h2>

                    <form className="flex flex-wrap -mx-3" onSubmit={handleSubmit}>
                        {/* Left Side */}
                        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="firstName">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    id="productName"
                                    placeholder="Add Product Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="lastName">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    id="sku"
                                    placeholder="SKU"
                                    onChange={(e) => setSku(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    value={stockQuantity}
                                    onChange={(e) => setStockQuantity(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                                    Category
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category :any) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="w-full md:w-1/2 px-3">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="message">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    placeholder="Description"
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    File Upload
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-500">
                                    Drag & Drop your files or <span className="text-blue-600 underline">Browse</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button (full width) */}
                        <div className="w-full px-3 mt-4 flex justify-end">
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out whitespace-nowrap"
                                aria-label="Add Category"
                            >
                                Add Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>


    );
};

export default AddEditProductPage;