import { useEffect, useState } from "react";
import {
    addProduct,
    getAllCategory,
    getProductById,
    getUnitsOfMeasurements,
    updateProduct,
} from "../../lib/api.ts";
import { FormBuilder } from "../form-builder/builder.tsx";
import { useParams, useNavigate } from "react-router-dom";
import { objectToFormData } from "../../lib/utils.ts";
import "./product.css";

export type TField<T> = {
    name: keyof T;
    type: 'text' | 'textarea' | 'number' | 'select';  // Add other types as needed
    label: string;
    min?: number;  // If min is supported
    data?: { label: string; value: string }[];  // For select fields
    // ... other properties
};



type TFormValue = {
    name: string;
    id: string;
    sku: string;
    price: number;
    stockQuantity: number;
    categoryId: string;
    description: string;
    imageFile: File;
    lowStockThreshold: number;
    uomId: number;
};

type TCategorie = {
    name: string;
    id: number;
};

type TUnitsOfMeasurement = {
    name: string;
    abbr: string;
    id: number;
};

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast toast-${type}`}>
            <span>{message}</span>
            <button onClick={onClose} className="toast-close">×</button>
        </div>
    );
}

export function AddEditProductPage() {
    const [categories, setCategories] = useState<TCategorie[]>([]);
    const [unitsOfMeasurements, setUnitsOfMeasurement] = useState<
        TUnitsOfMeasurement[]
    >([]);
    const [editData, setEditDate] = useState<TFormValue | undefined>(undefined);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { productId } = useParams();
    const navigate = useNavigate();

    const getCategories = async () => {
        try {
            const response = await getAllCategory();
            if (response.status === 200) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getMeasurements = async () => {
        try {
            const response = await getUnitsOfMeasurements();
            if (response.status === 200) {
                setUnitsOfMeasurement(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchProductById = async () => {
        if (productId) {
            try {
                const response = (await getProductById(productId)) as any;
                const productData = response.data;
                if (response.status === 200) {
                    setEditDate(productData);
                }
            } catch (error) {
                console.log(error);
                showToast('Failed to load product data', 'error');
            }
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleSubmit = async (data: TFormValue) => {
        console.log(data);

        setIsSubmitting(true);
        try {
            const arg = objectToFormData(data);

            if (data?.id) {
                await updateProduct(data);
                showToast('Product updated successfully!', 'success');
            } else {
                await addProduct(arg);
                showToast('Product added successfully!', 'success');
            }

            // Wait a moment to show the success message, then redirect
            setTimeout(() => {
                navigate('/products'); // Adjust this route to your products listing page
            }, 1500);

        } catch (error) {
            console.error('Error saving product:', error);
            showToast('Failed to save product. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/products'); // Adjust this route to your products listing page
    };

    useEffect(() => {
        getCategories();
        getMeasurements();
        fetchProductById();
    }, []);

    return (
        <div className="inventory-container">
            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div className="inventory-header">
                <div>
                    <h1 className="inventory-title">
                        {editData?.id ? "Edit Product" : "Add New Product"}
                    </h1>
                    <p className="inventory-subtitle">
                        Manage your inventory details below
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="inventory-form-card">
                <FormBuilder<TFormValue>
                    fields={[
                        { name: "name", type: "text", label: "Product Name", required: true },
                        { name: "description", type: "textarea", label: "Description" },
                        { name: "sku", type: "text", label: "SKU", required: true },
                        { name: "price", type: "number", label: "Price", required: true, min: 0 },
                        { name: "stockQuantity", type: "number", label: "Stock Quantity", required: true, min: 0 },
                        { name: "lowStockThreshold", type: "number", label: "Low Stock Threshold", required: true, min: 0 },
                        {
                            name: "uomId",
                            type: "select",
                            label: "Unit of Measurement",
                            required: true,
                            data: unitsOfMeasurements?.map((c) => ({
                                label: c.name,
                                value: String(c.id),
                            })),
                        },
                        {
                            name: "categoryId",
                            type: "select",
                            label: "Category",
                            required: true,
                            data: categories?.map((c) => ({
                                label: c.name,
                                value: String(c.id),
                            })),
                        },
                    ] as TField<TFormValue>[]}
                    defaultValues={{
                        name: "",
                        price: 0,
                        stockQuantity: 0,
                        lowStockThreshold: 0,
                    }}
                    onSubmit={handleSubmit}
                    values={editData}
                    btnLable={editData?.id ? "Save Changes" : "Add Product"}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
}