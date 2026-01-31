import { apiInstance } from "../context/apiInstance.ts";

export const getAllCategory = () => apiInstance.get("/categories/all");
export const getUnitsOfMeasurements = () => apiInstance.get("/lookup/get-units-of-measurements");

export const createCategory = (data: any) =>
  apiInstance.post("/categories/add", data);

export const updateCategory = (categoryId: any, data: any) =>
  apiInstance.put(`/categories/update/${categoryId}`, data);

export const deleteCategory = (id: any) =>
  apiInstance.delete(`/categories/delete/${id}`);

export const addProduct = (data: any) =>
  apiInstance.post("/products/add", data);

export const updateProduct = (data: any) =>
  apiInstance.put(`/categories/update`, data);

export const getAllProducts = () => apiInstance.get("/products/all");


export const sellProduct = (data: any) =>
    apiInstance.post("/transactions/sell", data);
export const deleteProduct = (id: number) =>
  apiInstance.delete(`/products/delete/${id}`);

export const getProductById = (id: any) => apiInstance.get(`/products/${id}`);

export const searchProduct = (searchValue: string) =>
  apiInstance.get("/products/search", {
    params: { searchValue },
  });

export const getAllSuppliers = () => apiInstance.get("/suppliers/all");

export const getSupplierById = (id: any) => apiInstance.get(`/suppliers/${id}`);

export const updateSupplier = (supplierId: any, data: any) =>
  apiInstance.put(`/suppliers/update/${supplierId}`, data);

export const deleteSupplier = (id: number) =>
  apiInstance.delete(`/suppliers/delete/${id}`);

export const addSupplier = (data: any) =>
  apiInstance.post("/suppliers/add", data);

export const getTransactionById = (id: any) =>
  apiInstance.get(`/transactions/get-transaction-by-id/${id}`);

export const updateTransactionStatus = (id: any, status: any) =>
  apiInstance.put(`/transactions/${id}`, status);

export const getAllTransactions = () => apiInstance.get("/transactions/all");
export const geInventoryReport = () => apiInstance.get("/reports/inventory");

export const purchaseProduct = (data: any) =>
    apiInstance.post("/transactions/purchase", data);

export const authenticate  = (loginData: any) =>
    apiInstance.post("/auth/login", loginData);
export const getSalesSummaryHeaderDashboard = () =>
    apiInstance.get("/dashboard/get-sales-summary-header");

export const getLast30DayTransactions = () =>
    apiInstance.get("/dashboard/transactions");

export const getAllUsers = () =>
    apiInstance.get("/users/all");

export const getResources = () =>
    apiInstance.get("/security/resources");

export const getRoles = () =>
    apiInstance.get("/security/roles");

export const getRoleResources = (role:string) =>
    apiInstance.get(`/security/role-resources/${role}`);

export const updateUser = (id: any,data: any) =>
    apiInstance.post(`/api/users/update/${id}`, data);
// static async getAllTransactions(filter) {
//     const response = await axios.get(`${this.BASE_URL}/transactions/all`, {
//         headers: this.getHeader(),
//         params: {filter}
//     })
//     return response.data;
// }

// static async getTransactionById(transactionId) {
//     const response = await axios.get(`${this.BASE_URL}/transactions/${transactionId}`, {
//         headers: this.getHeader()
//     })
//     return response.data;
// }

// static async getProductById(productId) {
//     const response = await axios.get(`${this.BASE_URL}/products/${productId}`, {
//         headers: this.getHeader()
//     });
//     return response.data;
// }
//
// static async searchProduct(searchValue) {
//     const response = await axios.get(`${this.BASE_URL}/products/search`, {
//         params: { searchValue },
//         headers: this.getHeader()
//     });
//     return response.data;
// }
//
// static async deleteProduct(productId) {
//     const response = await axios.delete(`${this.BASE_URL}/products/delete/${productId}`, {
//         headers: this.getHeader()
//     });
//     return response.data;
// }

// static async getAllProducts() {
//     const response = await axios.get(`${this.BASE_URL}/products/all`, {
//         headers: this.getHeader()
//     });
//     return response.data;
// }

// static async updateProduct(formData) {
//
//     const response = await axios.put(`${this.BASE_URL}/products/update`, formData, {
//         headers: {
//             ...this.getHeader(),
//             "Content-Type": "multipart/form-data"
//         }
//     });
//     return response.data;
// }
