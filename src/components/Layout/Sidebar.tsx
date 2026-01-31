import {
  LayoutDashboard,
  CreditCard,
  Settings,
  FileText,
  ChevronDown,
  Barcode,
  ShoppingCartIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../security/AuthContext";

const allMenuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { id: "product", icon: Barcode, label: "Product", path: "/product" },
  { id: "productCategory", icon: Barcode, label: "Product Category", path: "/product-category" },
  { id: "supplier", icon: Barcode, label: "Supplier", path: "/supplier" },
  { id: "purchase", icon: ShoppingCartIcon, label: "Purchase", path: "/purchase" },
  { id: "sell", icon: ShoppingCartIcon, label: "Sell", path: "/sell" },
  { id: "transactions", icon: CreditCard, label: "Transactions", path: "/transactions" },
  {
    id: "reports",
    icon: FileText,
    label: "Reports",
    path: "/reports",
    submenu: [
      { id: "salesReport", label: "Sales Report", path: "/reports/sales" },
      { id: "inventoryReport", label: "Inventory Report", path: "/reports/inventory" },
    ],
  },
  { id: "manage-user", icon: Settings, label: "Users", path: "/users" },
  { id: "roles", icon: Settings, label: "Roles", path: "/roles" },
];

function Sidebar({ collapsed, onPageChange }: any) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  
  const currentPage = location.pathname.replace("/", "") || "dashboard";

 
  const filteredMenuItems = useMemo(() => {
    if (!user) return [];
    
    return allMenuItems.filter(item => {
   
      if (item.id === "dashboard") return true;
      
     
      return hasPermission(item.id);
    });
  }, [user, hasPermission]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };


  if (!user || filteredMenuItems.length === 0) {
    return null;
  }

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-72"
      } transition-all duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 
      dark:border-slate-700/50 flex flex-col relative z-10`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3">
          <img  src="/hulu.ico"  alt="Hulu Logo" className="h-8 w-auto" />
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                HULU
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin Panel
              </p>
              <div className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                Role: <span className="font-semibold capitalize">{user.role.toLowerCase()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

    
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isExpanded = expandedItems.has(item.id);

          return (
            <div key={item.id}>
              {item.submenu ? (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 
                    ${
                      currentPage === item.id || currentPage.startsWith(item.id)
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    {!collapsed && (
                      <span className="font-medium ml-2">{item.label}</span>
                    )}
                  </div>
                  {!collapsed && item.submenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => onPageChange?.(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 
                    ${
                      currentPage === item.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    {!collapsed && (
                      <span className="font-medium ml-2">{item.label}</span>
                    )}
                  </div>
                </Link>
              )}

            
              {!collapsed && item.submenu && isExpanded && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.id}
                      to={subitem.path}
                      onClick={() => onPageChange?.(subitem.id)}
                      className={`block p-2 text-sm rounded-lg transition-all ${
                        currentPage === subitem.id
                          ? "bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {subitem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;

