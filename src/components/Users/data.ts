export interface Data {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    roleId?: number; // Optional field with specific values
}


export interface UserFormProps {
    user: Data | null;
    onSave: (data: Data) => void;
    onCancel: () => void;
}

export interface Resource {
    id: string | number; // Or whatever unique identifier you use
    name: string;
}

export interface Product {
    id: string;
    name: string;
    type: "text" | "textarea" | "number" | "select"; // Restricting types for safety
    label: string;
    sku: string;
    price: number;
    stockQuantity: number;
    lowStockThreshold: number;
    uomId: string | number;
    categoryId: string | number;
    // Optional fields
    description?: string;
    required?: boolean;
    min?: number;
    data?: SelectOption[];
}

export interface Suppliers {
    name: string;
    id: string;
}

export interface SelectOption {
    label: string;
    value: string | number;
}


export interface ChartData {
 date:string;
sales:number;
purchases:number;
directSales:number;
}