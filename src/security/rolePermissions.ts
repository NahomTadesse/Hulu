
export interface Resource {
  path: string;
  name: string;
  icon?: string;
}

export const SIDEBAR_RESOURCES: Resource[] = [
  { path: "/dashboard", name: "Dashboard" },
  { path: "/product", name: "Product" },
  { path: "/product-category", name: "Product Category" },
  { path: "/supplier", name: "Supplier" },
  { path: "/purchase", name: "Purchase" },
  { path: "/sell", name: "Sell" },
  { path: "/transactions", name: "Transactions" },
  { path: "/reports", name: "Reports" },
  { path: "/users", name: "Users" },
  { path: "/roles", name: "Roles" },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    "/dashboard",
    "/product",
    "/product-category",
    "/supplier",
    "/purchase",
    "/sell",
    "/transactions",
    "/reports",
    "/users",
    "/roles"
  ],
  MANAGER: [
    "/dashboard",
    "/product",
    "/product-category",
    "/supplier",
    "/purchase",
    "/sell",
    "/transactions",
    "/reports"
  ],
  CASHIER: [
    "/dashboard",
    "/sell",
    "/transactions"
  ]
};