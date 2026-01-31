import  { useState, useEffect } from 'react';
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import {getLast30DayTransactions, getSalesSummaryHeaderDashboard} from "../../lib/api.ts";
import type {ChartData} from "../Users/data.ts";

// ETB Currency Formatter (Ethiopian Birr)
const etbFormatter = (value: number) => {
    return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const etbFormatterWithCents = (value: number) => {
    return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
    }).format(value);
};

const Dashboard = () => {
    const [salesSummary, setSalesSummary] = useState<any>(null);
   //  const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
    const [chartData, setChartData] = useState<any[]>([]);
    const [totalDirectSales, setTotalDirectSales] = useState(0);

    // Dummy chart dummy data (keep for now)
    // const generateDummyChartData = () => {
    //     const today = new Date();
    //     const dummy = [];
    //     for (let i = 29; i >= 0; i--) {
    //         const date = subDays(today, i);
    //         const directSalesVal = Math.random() > 0.7
    //             ? Math.floor(Math.random() * 800000) + 200000
    //             : Math.floor(Math.random() * 300000) + 50000;
    //
    //         dummy.push({
    //             date: format(date, 'yyyy-MM-dd'),
    //             sales: Math.floor(Math.random() * 15000) + 3000,
    //             purchases: Math.floor(Math.random() * 10000) + 2000,
    //             directSales: directSalesVal
    //         });
    //     }
    //     return dummy;
    // };

    // const [data] = useState(generateDummyChartData());

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getSalesSummaryHeaderDashboard();
                if (res?.status === 200) {
                    setSalesSummary(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        const fetchTransactionData = async () => {
            try {
                setLoading(true);
                const response = await getLast30DayTransactions();
                if (response?.status === 200) {

                    const res = response.data as ChartData[];


                    let totalDirect = 0;
                    const aggregated = res.map(item => {
                        totalDirect += item.directSales;
                        return {
                            label: format(new Date(item.date),
                                selectedTimeframe === 'daily'
                                    ? 'dd MMM'
                                    : selectedTimeframe === 'weekly'
                                        ? 'MMM dd'
                                        : 'MMM yyyy'),
                            ...item
                        };
                    });

                    setChartData(aggregated);
                    setTotalDirectSales(totalDirect);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };




        fetchData();
        fetchTransactionData();
    }, []);

    //
    // useEffect(() => {
    //     let totalDirect = 0;
    //     const aggregated = data.map(item => {
    //         totalDirect += item.directSales;
    //         return {
    //             label: format(new Date(item.date),
    //                 selectedTimeframe === 'daily'
    //                     ? 'dd MMM'
    //                     : selectedTimeframe === 'weekly'
    //                         ? 'MMM dd'
    //                         : 'MMM yyyy'),
    //             ...item
    //         };
    //     });
    //
    //     setChartData(aggregated);
    //     setTotalDirectSales(totalDirect);
    //
    // }, [data, selectedTimeframe]);

    // useEffect(() => {
    //     let totalDirect = 0;
    //     const aggregated = data.map(item => {
    //         totalDirect += item.directSales;
    //         return {
    //             label: format(new Date(item.date), selectedTimeframe === 'daily' ? 'dd MMM' : selectedTimeframe === 'weekly' ? 'MMM dd' : 'MMM yyyy'),
    //             ...item
    //         };
    //     });
    //     setChartData(aggregated);
    //     setTotalDirectSales(totalDirect);
    // }, [data, selectedTimeframe]);

    const SummaryCard = ({ colorClass, title, orderCount, amount }: any) => (
        <div className={`${colorClass} rounded-xl p-6 shadow-lg flex items-center justify-between text-white h-32 transition hover:shadow-xl`}>
            {/* ETB Icon */}
            <div className="text-6xl font-bold opacity-90 select-none">
                Br
            </div>
            <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">{title}</p>
                <div className="flex items-baseline justify-end gap-2">
                    <span className="text-3xl font-extrabold">{orderCount ?? 0}</span>
                    <span className="text-sm opacity-80">orders</span>
                </div>
                <p className="text-2xl font-bold mt-1">{etbFormatter(amount ?? 0)}</p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-2xl text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Inventory & Sales Dashboard</h1>

             Controls
            <div className="flex gap-4 mb-8">
                <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="px-5 py-3 border rounded-lg bg-white shadow focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>

            {/* Top Summary Cards – Now in ETB */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <SummaryCard
                    colorClass="bg-gradient-to-br from-cyan-500 to-cyan-700"
                    title="TODAY SALES"
                    orderCount={salesSummary?.today?.totalOrders}
                    amount={salesSummary?.today?.totalPrice}
                />
                <SummaryCard
                    colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
                    title={`${salesSummary?.Month?.toUpperCase() || 'CURRENT MONTH'} SALES`}
                    orderCount={salesSummary?.monthToDateSales?.totalOrders}
                    amount={salesSummary?.monthToDateSales?.totalPrice}
                />
                <SummaryCard
                    colorClass="bg-gradient-to-br from-green-500 to-green-700"
                    title="TOTAL INVOICES MTD"
                    orderCount={salesSummary?.monthToDateInvoiced?.totalOrders}
                    amount={salesSummary?.monthToDateInvoiced?.totalPrice}
                />
                <SummaryCard
                    colorClass="bg-gradient-to-br from-blue-600 to-blue-800"
                    title="FUTURE / PENDING SALES"
                    orderCount={salesSummary?.futureSales?.totalOrders}
                    amount={salesSummary?.futureSales?.totalPrice}
                />
            </div>

            {/* You can keep the rest of your charts exactly as before */}
            {/* Just update any currency tooltip/format to use etbFormatter */}

            {/* Example: Sales Order Summary Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Sales Summary (ETB)</h2>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={etbFormatter} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: any) => etbFormatterWithCents(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="directSales" name="Direct Sales" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
                <div className="mt-6 text-right">
                    <p className="text-lg font-semibold text-gray-700">
                        Total Direct Sales (30 days): <span className="text-3xl text-cyan-600">{etbFormatterWithCents(totalDirectSales)}</span>
                    </p>
                </div>
            </div>

            {/* Keep your Product Details & Top Selling Items as they are */}
            {/* ... rest of your beautiful UI ... */}

        </div>
    );
};

export default Dashboard;




// import React, { useState, useEffect } from 'react';
// import {
//     LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//     XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
// import { getSalesSummaryHeaderDashboard } from "../../lib/api.ts";
//
// interface SalesSummary {
//     today: { totalPrice: number; totalOrders: number };
//     monthToDateSales: { totalPrice: number; totalOrders: number };
//     monthToDateInvoiced: { totalPrice: number; totalOrders: number };
//     futureSales: { totalPrice: number; totalOrders: number };
//     Month: string;
// }
//
// const Dashboard = () => {
//     const [data, setData] = useState<any[]>([]);
//     const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
//     const [chartData, setChartData] = useState<any[]>([]);
//     const [totalDirectSales, setTotalDirectSales] = useState(0);
//
//     // Static data (you can later replace with API calls)
//     const activeItemsData = [
//         { name: 'Active', value: 95 },
//         { name: 'Inactive', value: 5 },
//     ];
//     const PIE_COLORS = ['#34d399', '#f3f4f6'];
//
//     const topSellingItems = [
//         { id: 1, name: 'Wireless Ergonomic Keyboard', price: 120.00, sold: 342 },
//         { id: 2, name: 'Noise Cancelling Headphones', price: 259.00, sold: 215 },
//         { id: 3, name: '27-inch 4K Monitor', price: 399.00, sold: 180 },
//         { id: 4, name: 'USB-C Multi-port Adapter', price: 45.50, sold: 120 },
//         { id: 5, name: 'Laptop Stand Adjustable', price: 35.00, sold: 98 },
//     ];
//
//     // Generate dummy chart data (you can replace this with real sales history API later)
//     const generateDummyChartData = () => {
//         const today = new Date();
//         const dummy = [];
//         for (let i = 29; i >= 0; i--) {
//             const date = subDays(today, i);
//             const isSpike = Math.random() > 0.7;
//             const directSalesVal = isSpike
//                 ? Math.floor(Math.random() * 16000) + 8000
//                 : Math.floor(Math.random() * 8000) + 2000;
//
//             dummy.push({
//                 date: format(date, 'yyyy-MM-dd'),
//                 sales: Math.floor(Math.random() * 450) + 100,
//                 purchases: Math.floor(Math.random() * 300) + 50,
//                 directSales: directSalesVal
//             });
//         }
//         return dummy;
//     };
//
//     // Fetch real sales summary from backend
//     useEffect(() => {
//         const fetchSalesSummary = async () => {
//             try {
//                 setLoading(true);
//                 const response = await getSalesSummaryHeaderDashboard();
//
//                 if (response?.status === 200 && response.data) {
//                     setSalesSummary(response.data);
//                 } else {
//                     console.error("Invalid response format");
//                 }
//             } catch (error: any) {
//                 console.error("Error fetching sales summary:", error);
//                 // Optional: show toast/notification
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchSalesSummary();
//         setData(generateDummyChartData()); // Remove this when you have real chart API
//     }, []);
//
//     // Process chart data based on timeframe
//     useEffect(() => {
//         if (!data.length) return;
//
//         let aggregated: any[] = [];
//         let totalDirect = 0;
//
//         const processData = () => {
//             if (selectedTimeframe === 'daily') {
//                 aggregated = data.map(item => {
//                     totalDirect += item.directSales;
//                     return {
//                         label: format(new Date(item.date), 'dd MMM'),
//                         sales: item.sales,
//                         purchases: item.purchases,
//                         directSales: item.directSales
//                     };
//                 });
//             } else if (selectedTimeframe === 'weekly') {
//                 const weeks: any = {};
//                 data.forEach(item => {
//                     totalDirect += item.directSales;
//                     const weekStart = format(startOfWeek(new Date(item.date)), 'MMM dd');
//                     if (!weeks[weekStart]) weeks[weekStart] = { sales: 0, purchases: 0, directSales: 0 };
//                     weeks[weekStart].sales += item.sales;
//                     weeks[weekStart].purchases += item.purchases;
//                     weeks[weekStart].directSales += item.directSales;
//                 });
//                 aggregated = Object.entries(weeks).map(([label, values]: any) => ({ label, ...values }));
//             } else if (selectedTimeframe === 'monthly') {
//                 const months: any = {};
//                 data.forEach(item => {
//                     totalDirect += item.directSales;
//                     const monthKey = format(startOfMonth(new Date(item.date)), 'MMM yyyy');
//                     if (!months[monthKey]) months[monthKey] = { sales: 0, purchases: 0, directSales: 0 };
//                     months[monthKey].sales += item.sales;
//                     months[monthKey].purchases += item.purchases;
//                     months[monthKey].directSales += item.directSales;
//                 });
//                 aggregated = Object.entries(months).map(([label, values]: any) => ({ label, ...values }));
//             }
//         };
//
//         processData();
//         setChartData(aggregated);
//         setTotalDirectSales(totalDirect);
//     }, [data, selectedTimeframe]);
//
//     const currencyFormatter = (value: number) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0,
//         }).format(value);
//     };
//
//     const currencyFormatterWithCents = (value: number) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//         }).format(value);
//     };
//
//     const SummaryCard = ({ colorClass, title, orderCount, amount }: any) => (
//         <div className={`${colorClass} rounded-lg p-5 shadow-md flex items-center justify-between text-white h-28 transition hover:shadow-lg`}>
//             <div className="text-5xl font-extralight opacity-80">ETB</div>
//             <div className="text-right">
//                 <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">{title}</p>
//                 <div className="flex items-baseline justify-end gap-2">
//                     <span className="text-3xl font-extrabold">{orderCount ?? 0}</span>
//                     <span className="text-sm opacity-80">orders →</span>
//                 </div>
//                 <p className="text-2xl font-bold mt-1">{currencyFormatter(amount ?? 0)}</p>
//             </div>
//         </div>
//     );
//
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-50">
//                 <div className="text-xl text-gray-600">Loading dashboard...</div>
//             </div>
//         );
//     }
//
//     return (
//         <div className="dashboard-container p-6 bg-gray-50 min-h-screen">
//             <h1 className="text-3xl font-bold mb-8 text-gray-800">Inventory & Sales Dashboard</h1>
//
//             {/* Timeframe Selector */}
//             {/*<div className="flex gap-4 mb-8">*/}
//             {/*    <select*/}
//             {/*        value={selectedTimeframe}*/}
//             {/*        onChange={(e) => setSelectedTimeframe(e.target.value)}*/}
//             {/*        className="px-4 py-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"*/}
//             {/*    >*/}
//             {/*        <option value="daily">Daily</option>*/}
//             {/*        <option value="weekly">Weekly</option>*/}
//             {/*        <option value="monthly">Monthly</option>*/}
//             {/*    </select>*/}
//             {/*    <button*/}
//             {/*        onClick={() => setData(generateDummyChartData())}*/}
//             {/*        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"*/}
//             {/*    >*/}
//             {/*        Refresh Chart*/}
//             {/*    </button>*/}
//             {/*</div>*/}
//
//             {/* Top Summary Cards - Now Using Real API Data */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//                 <SummaryCard
//                     colorClass="bg-gradient-to-br from-cyan-500 to-cyan-600"
//                     title="TODAY SALES"
//                     orderCount={salesSummary?.today?.totalOrders}
//                     amount={salesSummary?.today?.totalPrice}
//                 />
//                 <SummaryCard
//                     colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
//                     title={`${salesSummary?.Month?.toUpperCase() || 'THIS MONTH'} SALES`}
//                     orderCount={salesSummary?.monthToDateSales?.totalOrders}
//                     amount={salesSummary?.monthToDateSales?.totalPrice}
//                 />
//                 <SummaryCard
//                     colorClass="bg-gradient-to-br from-green-500 to-green-600"
//                     title="TOTAL INVOICES MTD"
//                     orderCount={salesSummary?.monthToDateInvoiced?.totalOrders}
//                     amount={salesSummary?.monthToDateInvoiced?.totalPrice}
//                 />
//                 <SummaryCard
//                     colorClass="bg-gradient-to-br from-blue-600 to-blue-700"
//                     title="FUTURE / PENDING SALES"
//                     orderCount={salesSummary?.futureSales?.totalOrders}
//                     amount={salesSummary?.futureSales?.totalPrice}
//                 />
//             </div>
//
//             {/* Rest of your charts remain the same */}
//             {/* ... (Sales Trends, Purchases, Sales Order Summary, Product Details, Top Items) */}
//             {/* You can keep all the existing chart sections below unchanged */}
//             {/* They already work perfectly with dummy data for now */}
//
//             {/* Example: Keep one chart section */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
//                 <div className="bg-white p-6 rounded-xl shadow border">
//                     <h2 className="text-lg font-bold text-gray-800 mb-4">Sales Trends</h2>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <LineChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis dataKey="label" />
//                             <YAxis />
//                             <Tooltip formatter={currencyFormatterWithCents} />
//                             <Legend />
//                             <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} />
//                             <Line type="monotone" dataKey="directSales" stroke="#06b6d4" strokeWidth={2} dot={false} />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//
//                 {/* Add more charts as needed... */}
//             </div>
//
//             {/* Keep your Product Details & Top Selling Items sections exactly as they are */}
//             {/* They are already perfect */}
//         </div>
//     );
// };
//
// export default Dashboard;









// import React, { useState, useEffect } from 'react';
// import {
//     LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//     XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
// import {getSalesSummaryHeaderDashboard} from "../../lib/api.ts";
//
// const Dashboard = () => {
//     const [data, setData] = useState([]);
//     const [salesSummary, setSalesSummary] = useState({});
//     const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
//     const [chartData, setChartData] = useState([]);
//     const [totalDirectSales, setTotalDirectSales] = useState(0);
//
//     // Data for the Product Details Pie Chart
//     const activeItemsData = [
//         { name: 'Active', value: 95 },
//         { name: 'Inactive', value: 5 },
//     ];
//     const PIE_COLORS = ['#34d399', '#f3f4f6'];
//
//     // === NEW DATA: Top Selling Items ===
//     const topSellingItems = [
//         { id: 1, name: 'Wireless Ergonomic Keyboard', price: 120.00, sold: 342 },
//         { id: 2, name: 'Noise Cancelling Headphones', price: 259.00, sold: 215 },
//         { id: 3, name: '27-inch 4K Monitor', price: 399.00, sold: 180 },
//         { id: 4, name: 'USB-C Multi-port Adapter', price: 45.50, sold: 120 },
//         { id: 5, name: 'Laptop Stand Adjustable', price: 35.00, sold: 98 },
//     ];
//
//     // Generate dummy data
//     const generateDummyData = () => {
//         const today = new Date('2025-11-20');
//         const dummy = [];
//         for (let i = 29; i >= 0; i--) {
//             const date = subDays(today, i);
//             const isSpike = Math.random() > 0.7;
//             const directSalesVal = isSpike ? Math.floor(Math.random() * 16000) + 2000 : Math.floor(Math.random() * 500);
//
//             dummy.push({
//                 date: format(date, 'yyyy-MM-dd'),
//                 sales: Math.floor(Math.random() * 450) + 50,
//                 purchases: Math.floor(Math.random() * 300) + 50,
//                 directSales: directSalesVal
//             });
//         }
//         return dummy;
//     };
//
//     useEffect(() => {
//         setData(generateDummyData());
//
//         const getSalesSummary = async () => {
//             try {
//                 const response = await getSalesSummaryHeaderDashboard();
//                 console.log(response);
//                 if (response.status === 200) {
//                     const dashboard = response.data;
//                     console.log(dashboard.today);
//                     setSalesSummary(dashboard);
//                     console.log(salesSummary);
//                     console.log(salesSummary.today);
//                 }
//             } catch (error: any) {
//             }
//         };
//
//         getSalesSummary();
//     }, []);
//
//
//
//
//
//     useEffect(() => {
//         if (!data.length) return;
//
//         let aggregated = [];
//         let totalDirect = 0;
//
//         if (selectedTimeframe === 'daily') {
//             aggregated = data.map(item => {
//                 totalDirect += item.directSales;
//                 return {
//                     label: format(new Date(item.date), 'dd MMM'),
//                     sales: item.sales,
//                     purchases: item.purchases,
//                     directSales: item.directSales
//                 };
//             });
//         } else if (selectedTimeframe === 'weekly') {
//             const weeks = {};
//             data.forEach(item => {
//                 totalDirect += item.directSales;
//                 const weekStart = format(startOfWeek(new Date(item.date)), 'MMM dd');
//                 if (!weeks[weekStart]) weeks[weekStart] = { sales: 0, purchases: 0, directSales: 0 };
//                 weeks[weekStart].sales += item.sales;
//                 weeks[weekStart].purchases += item.purchases;
//                 weeks[weekStart].directSales += item.directSales;
//             });
//             aggregated = Object.entries(weeks).map(([label, values]) => ({ label, ...values }));
//         } else if (selectedTimeframe === 'monthly') {
//             const months = {};
//             data.forEach(item => {
//                 totalDirect += item.directSales;
//                 const monthStart = format(startOfMonth(new Date(item.date)), 'MMM yyyy');
//                 if (!months[monthStart]) months[monthStart] = { sales: 0, purchases: 0, directSales: 0 };
//                 months[monthStart].sales += item.sales;
//                 months[monthStart].purchases += item.purchases;
//                 months[monthStart].directSales += item.directSales;
//             });
//             aggregated = Object.entries(months).map(([label, values]) => ({ label, ...values }));
//         }
//
//         setChartData(aggregated);
//         setTotalDirectSales(totalDirect);
//     }, [data, selectedTimeframe,salesSummary]);
//
//     const currencyFormatter = (value) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0,
//         }).format(value);
//     };
//
//     const currencyFormatterWithCents = (value) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//         }).format(value);
//     };
//
//     const kFormatter = (num) => {
//         return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num);
//     };
//
//     const SummaryCard = ({ colorClass, title, orderCount, amount }) => (
//         <div className={`${colorClass} rounded-md p-4 shadow-sm flex items-center justify-between text-white h-24 transition hover:shadow-md`}>
//             <div className="flex items-center justify-center px-2">
//                 <span className="text-5xl font-light opacity-90">$</span>
//             </div>
//             <div className="text-right">
//                 <p className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">{title}</p>
//                 <div className="flex items-baseline justify-end gap-1">
//                     <span className="text-2xl font-bold">{orderCount}</span>
//                     <span className="text-sm font-medium opacity-90 mr-1">Orders =</span>
//                     <span className="text-2xl font-bold">{currencyFormatter(amount)}</span>
//                 </div>
//             </div>
//         </div>
//     );
//
//     return (
//         <div className="dashboard-container p-4 bg-gray-50 min-h-screen font-sans">
//             <h1 className="text-2xl font-bold mb-6 text-gray-800">Inventory Summary Dashboard</h1>
//
//             {/* Controls */}
//             <div className="flex gap-4 mb-6">
//                 <select
//                     value={selectedTimeframe}
//                     onChange={e => setSelectedTimeframe(e.target.value)}
//                     className="p-2 border rounded shadow-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                     <option value="daily">Daily</option>
//                     <option value="weekly">Weekly</option>
//                     <option value="monthly">Monthly</option>
//                 </select>
//
//                 <button
//                     onClick={() => setData(generateDummyData())}
//                     className="p-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition"
//                 >
//                     Refresh Data
//                 </button>
//             </div>
//
//             {/* Top Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <SummaryCard colorClass="bg-cyan-500" title="TODAY SALES" orderCount={0} amount={0} />
//                 <SummaryCard colorClass="bg-orange-400" title={`${format(new Date(), 'MMMM').toUpperCase()} ORDER DELIVERY`} orderCount={18} amount={12583} />
//                 <SummaryCard colorClass="bg-[#8dc63f]" title="TOTAL INVOICES MTD" orderCount={3} amount={358} />
//                 <SummaryCard colorClass="bg-[#3b5998]" title="FUTURE SALES" orderCount={1} amount={123} />
//             </div>
//
//             {/* Trends */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//                     <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales Trends</h2>
//                     <ResponsiveContainer width="100%" height={250}>
//                         <LineChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                             <XAxis dataKey="label" tick={{fontSize: 12}} />
//                             <YAxis tick={{fontSize: 12}} />
//                             <Tooltip />
//                             <Legend />
//                             <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//                     <h2 className="text-lg font-semibold mb-4 text-gray-700">Purchases Trends</h2>
//                     <ResponsiveContainer width="100%" height={250}>
//                         <BarChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                             <XAxis dataKey="label" tick={{fontSize: 12}} />
//                             <YAxis tick={{fontSize: 12}} />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="purchases" fill="#82ca9d" />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>
//
//             {/* Sales Order Summary */}
//             <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-6">
//                 <div className="flex justify-between items-center mb-6 border-b pb-4">
//                     <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
//                         Sales Order Summary (In USD)
//                     </h2>
//                     <div className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
//                         This Month <span className="ml-1">▼</span>
//                     </div>
//                 </div>
//                 <div className="flex flex-col md:flex-row">
//                     <div className="w-full md:w-3/4 pr-4">
//                         <ResponsiveContainer width="100%" height={300}>
//                             <LineChart data={chartData}>
//                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
//                                 <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6b7280'}} interval={selectedTimeframe === 'daily' ? 2 : 0} />
//                                 <YAxis axisLine={false} tickLine={false} tickFormatter={kFormatter} tick={{fontSize: 11, fill: '#6b7280'}} />
//                                 <Tooltip formatter={(value) => currencyFormatterWithCents(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
//                                 <Line type="linear" dataKey="directSales" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }} activeDot={{ r: 6 }} />
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </div>
//                     <div className="w-full md:w-1/4 mt-6 md:mt-0 md:pl-6 md:border-l border-gray-100 flex flex-col">
//                         <h3 className="text-gray-600 font-medium mb-4">Total Sales</h3>
//                         <div className="bg-sky-50 p-4 border-l-4 border-sky-400 rounded-r-md">
//                             <div className="flex items-center gap-2 mb-1">
//                                 <span className="w-2 h-2 rounded-full bg-sky-400"></span>
//                                 <span className="text-xs font-bold text-gray-500 uppercase">Direct Sales</span>
//                             </div>
//                             <div className="text-2xl font-bold text-gray-800">
//                                 {currencyFormatterWithCents(totalDirectSales)}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             {/* BOTTOM GRID */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//
//                 {/* Product Details */}
//                 <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
//                     <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-6">
//                         Product Details
//                     </h2>
//                     <div className="flex flex-col sm:flex-row">
//                         <div className="w-full sm:w-1/2 pr-0 sm:pr-8 sm:border-r border-gray-100">
//                             <div className="space-y-4">
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-red-500 font-medium">Low Stock Items</span>
//                                     <span className="text-red-500 font-bold text-xl">61</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-gray-500 font-medium">All Item Groups</span>
//                                     <span className="text-gray-800 font-bold text-xl">49</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-gray-500 font-medium">All Items</span>
//                                     <span className="text-gray-800 font-bold text-xl">319</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <div className="flex items-center gap-1 text-red-500 font-medium cursor-help group">
//                                         Unconfirmed Items
//                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                     </div>
//                                     <span className="text-red-500 font-bold text-xl">145</span>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="w-full sm:w-1/2 pl-0 sm:pl-8 mt-6 sm:mt-0 flex flex-col items-center justify-center">
//                             <h3 className="text-gray-500 mb-2">Active Items</h3>
//                             <div className="relative w-40 h-40">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Pie data={activeItemsData} cx="50%" cy="50%" innerRadius={55} outerRadius={70} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
//                                             {activeItemsData.map((entry, index) => (
//                                                 <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
//                                             ))}
//                                         </Pie>
//                                     </PieChart>
//                                 </ResponsiveContainer>
//                                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                                     <span className="text-emerald-400 font-bold text-xl">95%</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* === NEW WIDGET: TOP SELLING ITEMS === */}
//                 <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col">
//                     {/* Header */}
//                     <div className="p-6 border-b border-gray-100 flex justify-between items-center">
//                         <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
//                             Top Selling Items
//                         </h2>
//                         <div className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
//                             This Month <span className="ml-1">▼</span>
//                         </div>
//                     </div>
//
//                     {/* Table Area - Uses Flex-grow to fill height if needed */}
//                     <div className="p-0 flex-grow overflow-x-auto">
//                         <table className="w-full text-left">
//                             <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
//                             <tr>
//                                 <th className="px-6 py-3 font-medium">Item Name</th>
//                                 <th className="px-6 py-3 font-medium">Price</th>
//                                 <th className="px-6 py-3 font-medium text-right">Sold</th>
//                             </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-100">
//                             {topSellingItems.map((item) => (
//                                 <tr key={item.id} className="hover:bg-gray-50 transition-colors">
//                                     <td className="px-6 py-4 text-sm text-gray-800 font-medium">
//                                         {item.name}
//                                     </td>
//                                     <td className="px-6 py-4 text-sm text-gray-600">
//                                         {currencyFormatterWithCents(item.price)}
//                                     </td>
//                                     <td className="px-6 py-4 text-sm font-bold text-blue-600 text-right">
//                                         {item.sold}
//                                     </td>
//                                 </tr>
//                             ))}
//                             </tbody>
//                         </table>
//                     </div>
//
//                     {/* Footer / Action */}
//                     <div className="p-4 border-t border-gray-100 text-center">
//                         <button className="text-blue-500 text-sm font-medium hover:underline">
//                             View All Items &rarr;
//                         </button>
//                     </div>
//                 </div>
//
//             </div>
//         </div>
//     );
// };
//
// export default Dashboard;
































//
//
// import React, { useState, useEffect } from 'react';
// import {
//     LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//     XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
//
// const Dashboard = () => {
//     const [data, setData] = useState([]);
//     const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
//     const [chartData, setChartData] = useState([]);
//     const [totalDirectSales, setTotalDirectSales] = useState(0);
//
//     // Data for the Product Details Pie Chart
//     const activeItemsData = [
//         { name: 'Active', value: 95 },
//         { name: 'Inactive', value: 5 },
//     ];
//     const PIE_COLORS = ['#34d399', '#f3f4f6'];
//
//     // Generate dummy data
//     const generateDummyData = () => {
//         const today = new Date('2025-11-20');
//         const dummy = [];
//         for (let i = 29; i >= 0; i--) {
//             const date = subDays(today, i);
//             const isSpike = Math.random() > 0.7;
//             const directSalesVal = isSpike ? Math.floor(Math.random() * 16000) + 2000 : Math.floor(Math.random() * 500);
//
//             dummy.push({
//                 date: format(date, 'yyyy-MM-dd'),
//                 sales: Math.floor(Math.random() * 450) + 50,
//                 purchases: Math.floor(Math.random() * 300) + 50,
//                 directSales: directSalesVal
//             });
//         }
//         return dummy;
//     };
//
//     useEffect(() => {
//         setData(generateDummyData());
//     }, []);
//
//     useEffect(() => {
//         if (!data.length) return;
//
//         let aggregated = [];
//         let totalDirect = 0;
//
//         if (selectedTimeframe === 'daily') {
//             aggregated = data.map(item => {
//                 totalDirect += item.directSales;
//                 return {
//                     label: format(new Date(item.date), 'dd MMM'),
//                     sales: item.sales,
//                     purchases: item.purchases,
//                     directSales: item.directSales
//                 };
//             });
//         } else if (selectedTimeframe === 'weekly') {
//             const weeks = {};
//             data.forEach(item => {
//                 totalDirect += item.directSales;
//                 const weekStart = format(startOfWeek(new Date(item.date)), 'MMM dd');
//                 if (!weeks[weekStart]) weeks[weekStart] = { sales: 0, purchases: 0, directSales: 0 };
//                 weeks[weekStart].sales += item.sales;
//                 weeks[weekStart].purchases += item.purchases;
//                 weeks[weekStart].directSales += item.directSales;
//             });
//             aggregated = Object.entries(weeks).map(([label, values]) => ({ label, ...values }));
//         } else if (selectedTimeframe === 'monthly') {
//             const months = {};
//             data.forEach(item => {
//                 totalDirect += item.directSales;
//                 const monthStart = format(startOfMonth(new Date(item.date)), 'MMM yyyy');
//                 if (!months[monthStart]) months[monthStart] = { sales: 0, purchases: 0, directSales: 0 };
//                 months[monthStart].sales += item.sales;
//                 months[monthStart].purchases += item.purchases;
//                 months[monthStart].directSales += item.directSales;
//             });
//             aggregated = Object.entries(months).map(([label, values]) => ({ label, ...values }));
//         }
//
//         setChartData(aggregated);
//         setTotalDirectSales(totalDirect);
//     }, [data, selectedTimeframe]);
//
//     const currencyFormatter = (value) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0,
//         }).format(value);
//     };
//
//     const currencyFormatterWithCents = (value) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//         }).format(value);
//     };
//
//     const kFormatter = (num) => {
//         return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num);
//     };
//
//     // New Component for the Top Cards
//     const SummaryCard = ({ colorClass, title, orderCount, amount }) => (
//         <div className={`${colorClass} rounded-md p-4 shadow-sm flex items-center justify-between text-white h-24 transition hover:shadow-md`}>
//             <div className="flex items-center justify-center px-2">
//                 <span className="text-5xl font-light opacity-90">$</span>
//             </div>
//             <div className="text-right">
//                 <p className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">{title}</p>
//                 <div className="flex items-baseline justify-end gap-1">
//                     <span className="text-2xl font-bold">{orderCount}</span>
//                     <span className="text-sm font-medium opacity-90 mr-1">Orders =</span>
//                     <span className="text-2xl font-bold">{currencyFormatter(amount)}</span>
//                 </div>
//             </div>
//         </div>
//     );
//
//     return (
//         <div className="dashboard-container p-4 bg-gray-50 min-h-screen font-sans">
//
//             {/* Controls */}
//             <div className="flex gap-4 mb-6">
//                 <select
//                     value={selectedTimeframe}
//                     onChange={e => setSelectedTimeframe(e.target.value)}
//                     className="p-2 border rounded shadow-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                     <option value="daily">Daily</option>
//                     <option value="weekly">Weekly</option>
//                     <option value="monthly">Monthly</option>
//                 </select>
//
//                 <button
//                     onClick={() => setData(generateDummyData())}
//                     className="p-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition"
//                 >
//                     Refresh Data
//                 </button>
//             </div>
//
//             {/* === NEW REPORT: TOP METRIC CARDS === */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <SummaryCard
//                     colorClass="bg-cyan-500"
//                     title="TODAY SALES"
//                     orderCount={0}
//                     amount={0}
//                 />
//                 <SummaryCard
//                     colorClass="bg-orange-400"
//                     // Dynamic month name
//                     title={`${format(new Date(), 'MMMM').toUpperCase()} ORDER DELIVERY`}
//                     orderCount={18}
//                     amount={12583}
//                 />
//                 <SummaryCard
//                     colorClass="bg-[#8dc63f]" // Custom Lime Green from image
//                     title="TOTAL INVOICES MTD"
//                     orderCount={3}
//                     amount={358}
//                 />
//                 <SummaryCard
//                     colorClass="bg-[#3b5998]" // Custom Dark Blue from image
//                     title="FUTURE SALES"
//                     orderCount={1}
//                     amount={123}
//                 />
//             </div>
//
//             {/* Trends Section */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//                     <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales Trends</h2>
//                     <ResponsiveContainer width="100%" height={250}>
//                         <LineChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                             <XAxis dataKey="label" tick={{fontSize: 12}} />
//                             <YAxis tick={{fontSize: 12}} />
//                             <Tooltip />
//                             <Legend />
//                             <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//                     <h2 className="text-lg font-semibold mb-4 text-gray-700">Purchases Trends</h2>
//                     <ResponsiveContainer width="100%" height={250}>
//                         <BarChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                             <XAxis dataKey="label" tick={{fontSize: 12}} />
//                             <YAxis tick={{fontSize: 12}} />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="purchases" fill="#82ca9d" />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>
//
//             {/* Sales Order Summary Section */}
//             <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-6">
//                 <div className="flex justify-between items-center mb-6 border-b pb-4">
//                     <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
//                         Sales Order Summary (In USD)
//                     </h2>
//                     <div className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
//                         This Month <span className="ml-1">▼</span>
//                     </div>
//                 </div>
//
//                 <div className="flex flex-col md:flex-row">
//                     <div className="w-full md:w-3/4 pr-4">
//                         <ResponsiveContainer width="100%" height={300}>
//                             <LineChart data={chartData}>
//                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
//                                 <XAxis
//                                     dataKey="label"
//                                     axisLine={false}
//                                     tickLine={false}
//                                     tick={{fontSize: 11, fill: '#6b7280'}}
//                                     interval={selectedTimeframe === 'daily' ? 2 : 0}
//                                 />
//                                 <YAxis
//                                     axisLine={false}
//                                     tickLine={false}
//                                     tickFormatter={kFormatter}
//                                     tick={{fontSize: 11, fill: '#6b7280'}}
//                                 />
//                                 <Tooltip
//                                     formatter={(value) => currencyFormatterWithCents(value)}
//                                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
//                                 />
//                                 <Line
//                                     type="linear"
//                                     dataKey="directSales"
//                                     stroke="#38bdf8"
//                                     strokeWidth={2}
//                                     dot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
//                                     activeDot={{ r: 6 }}
//                                 />
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </div>
//                     <div className="w-full md:w-1/4 mt-6 md:mt-0 md:pl-6 md:border-l border-gray-100 flex flex-col">
//                         <h3 className="text-gray-600 font-medium mb-4">Total Sales</h3>
//                         <div className="bg-sky-50 p-4 border-l-4 border-sky-400 rounded-r-md">
//                             <div className="flex items-center gap-2 mb-1">
//                                 <span className="w-2 h-2 rounded-full bg-sky-400"></span>
//                                 <span className="text-xs font-bold text-gray-500 uppercase">Direct Sales</span>
//                             </div>
//                             <div className="text-2xl font-bold text-gray-800">
//                                 {currencyFormatterWithCents(totalDirectSales)}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             {/* Product Details & Placeholder */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
//                     <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-6">
//                         Product Details
//                     </h2>
//                     <div className="flex flex-col sm:flex-row">
//                         <div className="w-full sm:w-1/2 pr-0 sm:pr-8 sm:border-r border-gray-100">
//                             <div className="space-y-4">
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-red-500 font-medium">Low Stock Items</span>
//                                     <span className="text-red-500 font-bold text-xl">61</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-gray-500 font-medium">All Item Groups</span>
//                                     <span className="text-gray-800 font-bold text-xl">49</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-gray-500 font-medium">All Items</span>
//                                     <span className="text-gray-800 font-bold text-xl">319</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <div className="flex items-center gap-1 text-red-500 font-medium cursor-help group">
//                                         Unconfirmed Items
//                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                     </div>
//                                     <span className="text-red-500 font-bold text-xl">145</span>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="w-full sm:w-1/2 pl-0 sm:pl-8 mt-6 sm:mt-0 flex flex-col items-center justify-center">
//                             <h3 className="text-gray-500 mb-2">Active Items</h3>
//                             <div className="relative w-40 h-40">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Pie
//                                             data={activeItemsData}
//                                             cx="50%"
//                                             cy="50%"
//                                             innerRadius={55}
//                                             outerRadius={70}
//                                             startAngle={90}
//                                             endAngle={-270}
//                                             dataKey="value"
//                                             stroke="none"
//                                         >
//                                             {activeItemsData.map((entry, index) => (
//                                                 <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
//                                             ))}
//                                         </Pie>
//                                     </PieChart>
//                                 </ResponsiveContainer>
//                                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                                     <span className="text-emerald-400 font-bold text-xl">95%</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="hidden lg:flex bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-6 items-center justify-center text-gray-400">
//                     Next Widget Placeholder
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default Dashboard;
//





































//
// import React, { useState, useEffect } from 'react';
// import {
//     LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//     XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
//
// const Dashboard = () => {
//     const [data, setData] = useState([]);
//     const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
//     const [chartData, setChartData] = useState([]);
//     const [totalDirectSales, setTotalDirectSales] = useState(0);
//
//     // Data for the new Product Details Pie Chart
//     const activeItemsData = [
//         { name: 'Active', value: 95 },
//         { name: 'Inactive', value: 5 },
//     ];
//     const PIE_COLORS = ['#34d399', '#f3f4f6']; // Emerald Green & Light Gray
//
//     // Generate dummy data
//     const generateDummyData = () => {
//         const today = new Date('2025-11-20');
//         const dummy = [];
//         for (let i = 29; i >= 0; i--) {
//             const date = subDays(today, i);
//             const isSpike = Math.random() > 0.7;
//             const directSalesVal = isSpike ? Math.floor(Math.random() * 16000) + 2000 : Math.floor(Math.random() * 500);
//
//             dummy.push({
//                 date: format(date, 'yyyy-MM-dd'),
//                 sales: Math.floor(Math.random() * 450) + 50,
//                 purchases: Math.floor(Math.random() * 300) + 50,
//                 directSales: directSalesVal
//             });
//         }
//         return dummy;
//     };
//
//     useEffect(() => {
//         setData(generateDummyData());
//     }, []);
//
//     useEffect(() => {
//         if (!data.length) return;
//
//         let aggregated = [];
//         let totalDirect = 0;
//
//         if (selectedTimeframe === 'daily') {
//             aggregated = data.map(item => {
//                 totalDirect += item.directSales;
//                 return {
//                     label: format(new Date(item.date), 'dd MMM'),
//                     sales: item.sales,
//                     purchases: item.purchases,
//                     directSales: item.directSales
//                 };
//             });
//         } else if (selectedTimeframe === 'weekly') {
//             const weeks = {};
//             data.forEach(item => {
//                 totalDirect += item.directSales;
//                 const weekStart = format(startOfWeek(new Date(item.date)), 'MMM dd');
//                 if (!weeks[weekStart]) weeks[weekStart] = { sales: 0, purchases: 0, directSales: 0 };
//                 weeks[weekStart].sales += item.sales;
//                 weeks[weekStart].purchases += item.purchases;
//                 weeks[weekStart].directSales += item.directSales;
//             });
//             aggregated = Object.entries(weeks).map(([label, values]) => ({ label, ...values }));
//         } else if (selectedTimeframe === 'monthly') {
//             const months = {};
//             data.forEach(item => {
//                 totalDirect += item.directSales;
//                 const monthStart = format(startOfMonth(new Date(item.date)), 'MMM yyyy');
//                 if (!months[monthStart]) months[monthStart] = { sales: 0, purchases: 0, directSales: 0 };
//                 months[monthStart].sales += item.sales;
//                 months[monthStart].purchases += item.purchases;
//                 months[monthStart].directSales += item.directSales;
//             });
//             aggregated = Object.entries(months).map(([label, values]) => ({ label, ...values }));
//         }
//
//         setChartData(aggregated);
//         setTotalDirectSales(totalDirect);
//     }, [data, selectedTimeframe]);
//
//     const currencyFormatter = (value) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//         }).format(value);
//     };
//
//     const kFormatter = (num) => {
//         return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num);
//     };
//
//     return (
//         <div className="dashboard-container p-4 bg-gray-50 min-h-screen font-sans">
//             <h1 className="text-2xl font-bold mb-6 text-gray-800">Inventory Summary Dashboard</h1>
//
//             {/* Controls */}
//             <div className="flex gap-4 mb-6">
//                 <select
//                     value={selectedTimeframe}
//                     onChange={e => setSelectedTimeframe(e.target.value)}
//                     className="p-2 border rounded shadow-sm bg-white"
//                 >
//                     <option value="daily">Daily</option>
//                     <option value="weekly">Weekly</option>
//                     <option value="monthly">Monthly</option>
//                 </select>
//
//                 <button
//                     onClick={() => setData(generateDummyData())}
//                     className="p-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition"
//                 >
//                     Refresh Data
//                 </button>
//             </div>
//
//             {/* TOP ROW: Trends */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//                     <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales Trends</h2>
//                     <ResponsiveContainer width="100%" height={250}>
//                         <LineChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                             <XAxis dataKey="label" tick={{fontSize: 12}} />
//                             <YAxis tick={{fontSize: 12}} />
//                             <Tooltip />
//                             <Legend />
//                             <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//                     <h2 className="text-lg font-semibold mb-4 text-gray-700">Purchases Trends</h2>
//                     <ResponsiveContainer width="100%" height={250}>
//                         <BarChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                             <XAxis dataKey="label" tick={{fontSize: 12}} />
//                             <YAxis tick={{fontSize: 12}} />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="purchases" fill="#82ca9d" />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>
//
//             {/* MIDDLE ROW: Sales Order Summary */}
//             <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-6">
//                 <div className="flex justify-between items-center mb-6 border-b pb-4">
//                     <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
//                         Sales Order Summary (In USD)
//                     </h2>
//                     <div className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
//                         This Month <span className="ml-1">▼</span>
//                     </div>
//                 </div>
//
//                 <div className="flex flex-col md:flex-row">
//                     <div className="w-full md:w-3/4 pr-4">
//                         <ResponsiveContainer width="100%" height={300}>
//                             <LineChart data={chartData}>
//                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
//                                 <XAxis
//                                     dataKey="label"
//                                     axisLine={false}
//                                     tickLine={false}
//                                     tick={{fontSize: 11, fill: '#6b7280'}}
//                                     interval={selectedTimeframe === 'daily' ? 2 : 0}
//                                 />
//                                 <YAxis
//                                     axisLine={false}
//                                     tickLine={false}
//                                     tickFormatter={kFormatter}
//                                     tick={{fontSize: 11, fill: '#6b7280'}}
//                                 />
//                                 <Tooltip
//                                     formatter={(value) => currencyFormatter(value)}
//                                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
//                                 />
//                                 <Line
//                                     type="linear"
//                                     dataKey="directSales"
//                                     stroke="#38bdf8"
//                                     strokeWidth={2}
//                                     dot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
//                                     activeDot={{ r: 6 }}
//                                 />
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </div>
//                     <div className="w-full md:w-1/4 mt-6 md:mt-0 md:pl-6 md:border-l border-gray-100 flex flex-col">
//                         <h3 className="text-gray-600 font-medium mb-4">Total Sales</h3>
//                         <div className="bg-sky-50 p-4 border-l-4 border-sky-400 rounded-r-md">
//                             <div className="flex items-center gap-2 mb-1">
//                                 <span className="w-2 h-2 rounded-full bg-sky-400"></span>
//                                 <span className="text-xs font-bold text-gray-500 uppercase">Direct Sales</span>
//                             </div>
//                             <div className="text-2xl font-bold text-gray-800">
//                                 {currencyFormatter(totalDirectSales)}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             {/* BOTTOM ROW: Product Details & Placeholder */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//
//                 {/* === NEW REPORT: PRODUCT DETAILS === */}
//                 <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
//                     <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-6">
//                         Product Details
//                     </h2>
//
//                     <div className="flex flex-col sm:flex-row">
//                         {/* Left Column: List Items */}
//                         <div className="w-full sm:w-1/2 pr-0 sm:pr-8 sm:border-r border-gray-100">
//                             <div className="space-y-4">
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-red-500 font-medium">Low Stock Items</span>
//                                     <span className="text-red-500 font-bold text-xl">61</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-gray-500 font-medium">All Item Groups</span>
//                                     <span className="text-gray-800 font-bold text-xl">49</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-gray-500 font-medium">All Items</span>
//                                     <span className="text-gray-800 font-bold text-xl">319</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <div className="flex items-center gap-1 text-red-500 font-medium cursor-help group">
//                                         Unconfirmed Items
//                                         {/* Info Icon SVG */}
//                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                     </div>
//                                     <span className="text-red-500 font-bold text-xl">145</span>
//                                 </div>
//                             </div>
//                         </div>
//
//                         {/* Right Column: Donut Chart */}
//                         <div className="w-full sm:w-1/2 pl-0 sm:pl-8 mt-6 sm:mt-0 flex flex-col items-center justify-center">
//                             <h3 className="text-gray-500 mb-2">Active Items</h3>
//
//                             <div className="relative w-40 h-40">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Pie
//                                             data={activeItemsData}
//                                             cx="50%"
//                                             cy="50%"
//                                             innerRadius={55}
//                                             outerRadius={70}
//                                             startAngle={90}
//                                             endAngle={-270}
//                                             dataKey="value"
//                                             stroke="none"
//                                         >
//                                             {activeItemsData.map((entry, index) => (
//                                                 <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
//                                             ))}
//                                         </Pie>
//                                     </PieChart>
//                                 </ResponsiveContainer>
//                                 {/* Centered Percentage Text */}
//                                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                                     <span className="text-emerald-400 font-bold text-xl">95%</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* Placeholder for grid balance (Optional) */}
//                 <div className="hidden lg:flex bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-6 items-center justify-center text-gray-400">
//                     Next Widget Placeholder
//                 </div>
//
//             </div>
//         </div>
//     );
// };
//
// export default Dashboard;















// import React, { useState, useEffect } from 'react';
// import {
//     LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//     Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
//
// const Dashboard = () => {
//     const [data, setData] = useState([]);
//     const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
//     const [chartData, setChartData] = useState([]);
//     const [totalDirectSales, setTotalDirectSales] = useState(0);
//
//     // Generate dummy data
//     const generateDummyData = () => {
//         const today = new Date('2025-11-20');
//         const dummy = [];
//         for (let i = 29; i >= 0; i--) {
//             const date = subDays(today, i);
//             // Simulating the "spiky" data seen in your image (lots of lows, huge peaks)
//             const isSpike = Math.random() > 0.7;
//             const directSalesVal = isSpike ? Math.floor(Math.random() * 16000) + 2000 : Math.floor(Math.random() * 500);
//
//             dummy.push({
//                 date: format(date, 'yyyy-MM-dd'),
//                 sales: Math.floor(Math.random() * 450) + 50,
//                 purchases: Math.floor(Math.random() * 300) + 50,
//                 // specific data for the new report
//                 directSales: directSalesVal
//             });
//         }
//         return dummy;
//     };
//
//     useEffect(() => {
//         setData(generateDummyData());
//     }, []);
//
//     // Aggregate data based on timeframe
//     useEffect(() => {
//         if (!data.length) return;
//
//         let aggregated = [];
//         let totalDirect = 0;
//
//         if (selectedTimeframe === 'daily') {
//             aggregated = data.map(item => {
//                 totalDirect += item.directSales;
//                 return {
//                     label: format(new Date(item.date), 'dd MMM'), // Format: 01 Jan
//                     sales: item.sales,
//                     purchases: item.purchases,
//                     directSales: item.directSales
//                 };
//             });
//         } else if (selectedTimeframe === 'weekly') {
//             const weeks = {};
//             data.forEach(item => {
//                 totalDirect += item.directSales;
//                 const weekStart = format(startOfWeek(new Date(item.date)), 'MMM dd');
//                 if (!weeks[weekStart]) weeks[weekStart] = { sales: 0, purchases: 0, directSales: 0 };
//                 weeks[weekStart].sales += item.sales;
//                 weeks[weekStart].purchases += item.purchases;
//                 weeks[weekStart].directSales += item.directSales;
//             });
//             aggregated = Object.entries(weeks).map(([label, values]) => ({ label, ...values }));
//         } else if (selectedTimeframe === 'monthly') {
//             const months = {};
//             data.forEach(item => {
//                 totalDirect += item.directSales;
//                 const monthStart = format(startOfMonth(new Date(item.date)), 'MMM yyyy');
//                 if (!months[monthStart]) months[monthStart] = { sales: 0, purchases: 0, directSales: 0 };
//                 months[monthStart].sales += item.sales;
//                 months[monthStart].purchases += item.purchases;
//                 months[monthStart].directSales += item.directSales;
//             });
//             aggregated = Object.entries(months).map(([label, values]) => ({ label, ...values }));
//         }
//
//         setChartData(aggregated);
//         setTotalDirectSales(totalDirect);
//     }, [data, selectedTimeframe]);
//
//     // Formatter for currency
//     const currencyFormatter = (value) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//         }).format(value);
//     };
//
//     // Formatter for large numbers on Y-Axis (e.g., 16k)
//     const kFormatter = (num) => {
//         return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num);
//     };
//
//     return (
//         <div className="dashboard-container p-4 bg-gray-50 min-h-screen">
//             <h1 className="text-2xl font-bold mb-6 text-gray-800">Inventory Summary Dashboard</h1>
//
//             {/* Controls */}
//             <div className="flex gap-4 mb-6">
//                 <select
//                     value={selectedTimeframe}
//                     onChange={e => setSelectedTimeframe(e.target.value)}
//                     className="p-2 border rounded shadow-sm bg-white"
//                 >
//                     <option value="daily">Daily</option>
//                     <option value="weekly">Weekly</option>
//                     <option value="monthly">Monthly</option>
//                 </select>
//
//                 <button
//                     onClick={() => setData(generateDummyData())}
//                     className="p-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition"
//                 >
//                     Refresh Data
//                 </button>
//             </div>
//
//             {/* Original Charts Section */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                 <div className="bg-white p-4 rounded-lg shadow">
//                     <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales Trends</h2>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <LineChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                             <XAxis dataKey="label" tick={{fontSize: 12}} />
//                             <YAxis tick={{fontSize: 12}} />
//                             <Tooltip />
//                             <Legend />
//                             <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg shadow">
//                     <h2 className="text-lg font-semibold mb-4 text-gray-700">Purchases Trends</h2>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <BarChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                             <XAxis dataKey="label" tick={{fontSize: 12}} />
//                             <YAxis tick={{fontSize: 12}} />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="purchases" fill="#82ca9d" />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>
//
//             {/* NEW REPORT: SALES ORDER SUMMARY (Matching the uploaded image) */}
//             <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
//                 {/* Header */}
//                 <div className="flex justify-between items-center mb-6 border-b pb-4">
//                     <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
//                         Sales Order Summary (In USD)
//                     </h2>
//                     <div className="text-sm text-gray-500">
//                         {/* Static visual dropdown for effect, logic bound to main timeframe selector */}
//                         This Month <span className="ml-1">▼</span>
//                     </div>
//                 </div>
//
//                 <div className="flex flex-col md:flex-row">
//                     {/* Left: Chart Area (75%) */}
//                     <div className="w-full md:w-3/4 pr-4">
//                         <ResponsiveContainer width="100%" height={350}>
//                             <LineChart data={chartData}>
//                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
//                                 <XAxis
//                                     dataKey="label"
//                                     axisLine={false}
//                                     tickLine={false}
//                                     tick={{fontSize: 11, fill: '#6b7280'}}
//                                     interval={2} // Skip ticks to prevent overcrowding
//                                 />
//                                 <YAxis
//                                     axisLine={false}
//                                     tickLine={false}
//                                     tickFormatter={kFormatter}
//                                     tick={{fontSize: 11, fill: '#6b7280'}}
//                                 />
//                                 <Tooltip
//                                     formatter={(value) => currencyFormatter(value)}
//                                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
//                                 />
//                                 <Line
//                                     type="linear"
//                                     dataKey="directSales"
//                                     stroke="#38bdf8" // Sky blue color from image
//                                     strokeWidth={2}
//                                     dot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }} // Blue dots
//                                     activeDot={{ r: 6 }}
//                                 />
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </div>
//
//                     {/* Right: Summary Panel (25%) */}
//                     <div className="w-full md:w-1/4 mt-6 md:mt-0 md:pl-6 md:border-l border-gray-100 flex flex-col">
//                         <h3 className="text-gray-600 font-medium mb-4">Total Sales</h3>
//
//                         {/* The Blue Box */}
//                         <div className="bg-sky-50 p-4 border-l-4 border-sky-400 rounded-r-md">
//                             <div className="flex items-center gap-2 mb-1">
//                                 <span className="w-2 h-2 rounded-full bg-sky-400"></span>
//                                 <span className="text-xs font-bold text-gray-500 uppercase">Direct Sales</span>
//                             </div>
//                             <div className="text-2xl font-bold text-gray-800">
//                                 {currencyFormatter(totalDirectSales)}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//         </div>
//     );
// };
//
// export default Dashboard;



// Install dependencies: npm install recharts date-fns

// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
//
// const Dashboard = () => {
//     const [data, setData] = useState([]); // Dummy data
//     const [selectedTimeframe, setSelectedTimeframe] = useState('daily'); // 'daily', 'weekly', 'monthly'
//     const [chartData, setChartData] = useState([]); // Aggregated for chart
//
//     // Generate dummy data for the last 30 days
//     const generateDummyData = () => {
//         const today = new Date('2025-11-20'); // Current date as per context
//         const dummy = [];
//         for (let i = 29; i >= 0; i--) { // 30 days back
//             const date = subDays(today, i);
//             dummy.push({
//                 date: format(date, 'yyyy-MM-dd'),
//                 sales: Math.floor(Math.random() * 450) + 50, // Random 50-500
//                 purchases: Math.floor(Math.random() * 300) + 50, // Random 50-350
//             });
//         }
//         return dummy;
//     };
//
//     // Initialize dummy data on mount
//     useEffect(() => {
//         setData(generateDummyData());
//     }, []);
//
//     // Aggregate data based on timeframe
//     useEffect(() => {
//         if (!data.length) return;
//
//         let aggregated = [];
//         if (selectedTimeframe === 'daily') {
//             // Use raw daily data
//             aggregated = data.map(item => ({
//                 label: format(new Date(item.date), 'MMM dd'),
//                 sales: item.sales,
//                 purchases: item.purchases,
//             }));
//         } else if (selectedTimeframe === 'weekly') {
//             // Group by week
//             const weeks = {};
//             data.forEach(item => {
//                 const weekStart = format(startOfWeek(new Date(item.date)), 'MMM dd');
//                 if (!weeks[weekStart]) weeks[weekStart] = { sales: 0, purchases: 0 };
//                 weeks[weekStart].sales += item.sales;
//                 weeks[weekStart].purchases += item.purchases;
//             });
//             aggregated = Object.entries(weeks).map(([label, values]) => ({ label, ...values }));
//         } else if (selectedTimeframe === 'monthly') {
//             // Group by month
//             const months = {};
//             data.forEach(item => {
//                 const monthStart = format(startOfMonth(new Date(item.date)), 'MMM yyyy');
//                 if (!months[monthStart]) months[monthStart] = { sales: 0, purchases: 0 };
//                 months[monthStart].sales += item.sales;
//                 months[monthStart].purchases += item.purchases;
//             });
//             aggregated = Object.entries(months).map(([label, values]) => ({ label, ...values }));
//         }
//         setChartData(aggregated);
//     }, [data, selectedTimeframe]);
//
//     return (
//         <div className="dashboard-container p-4">
//             <h1 className="text-2xl font-bold mb-4">Inventory Summary Dashboard (Dummy Data)</h1>
//
//             {/* Timeframe Selector */}
//             <select
//                 value={selectedTimeframe}
//                 onChange={e => setSelectedTimeframe(e.target.value)}
//                 className="mb-4 p-2 border rounded"
//             >
//                 <option value="daily">Daily</option>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//             </select>
//
//             {/* Refresh Button for New Dummy Data */}
//             <button
//                 onClick={() => setData(generateDummyData())}
//                 className="mb-4 ml-4 p-2 bg-blue-500 text-white rounded"
//             >
//                 Refresh Dummy Data
//             </button>
//
//             {/* Sales and Purchases Chart */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                     <h2 className="text-xl mb-2">Sales Trends</h2>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <LineChart data={chartData}>
//                             <XAxis dataKey="label" />
//                             <YAxis />
//                             <Tooltip />
//                             <Legend />
//                             <Line type="monotone" dataKey="sales" stroke="#8884d8" />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//                 <div>
//                     <h2 className="text-xl mb-2">Purchases Trends</h2>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <BarChart data={chartData}>
//                             <XAxis dataKey="label" />
//                             <YAxis />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="purchases" fill="#82ca9d" />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default Dashboard;
//




























// // Install dependencies: npm install recharts date-fns axios react-query
//
// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { format, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
// import axios from 'axios';
//
// const Dashboard = () => {
//     const [data, setData] = useState([]); // Raw data from API
//     const [selectedTimeframe, setSelectedTimeframe] = useState('daily'); // 'daily', 'weekly', 'monthly'
//     const [chartData, setChartData] = useState([]); // Aggregated for chart
//
//     // Fetch data from backend (e.g., last 30 days)
//     useEffect(() => {
//         axios.get('/api/inventory/summary?period=last30days')
//             .then(response => setData(response.data))
//             .catch(error => console.error('Error fetching data:', error));
//     }, []);
//
//     // Aggregate data based on timeframe
//     useEffect(() => {
//         if (!data.length) return;
//
//         let aggregated = [];
//         if (selectedTimeframe === 'daily') {
//             // Use raw daily data
//             aggregated = data.map(item => ({
//                 label: format(new Date(item.date), 'MMM dd'),
//                 sales: item.sales,
//                 purchases: item.purchases,
//             }));
//         } else if (selectedTimeframe === 'weekly') {
//             // Group by week
//             const weeks = {};
//             data.forEach(item => {
//                 const weekStart = format(startOfWeek(new Date(item.date)), 'MMM dd');
//                 if (!weeks[weekStart]) weeks[weekStart] = { sales: 0, purchases: 0 };
//                 weeks[weekStart].sales += item.sales;
//                 weeks[weekStart].purchases += item.purchases;
//             });
//             aggregated = Object.entries(weeks).map(([label, values]) => ({ label, ...values }));
//         } else if (selectedTimeframe === 'monthly') {
//             // Group by month
//             const months = {};
//             data.forEach(item => {
//                 const monthStart = format(startOfMonth(new Date(item.date)), 'MMM yyyy');
//                 if (!months[monthStart]) months[monthStart] = { sales: 0, purchases: 0 };
//                 months[monthStart].sales += item.sales;
//                 months[monthStart].purchases += item.purchases;
//             });
//             aggregated = Object.entries(months).map(([label, values]) => ({ label, ...values }));
//         }
//         setChartData(aggregated);
//     }, [data, selectedTimeframe]);
//
//     return (
//         <div className="dashboard-container p-4">
//             <h1 className="text-2xl font-bold mb-4">Inventory Summary Dashboard</h1>
//
//             {/* Timeframe Selector */}
//             <select
//                 value={selectedTimeframe}
//                 onChange={e => setSelectedTimeframe(e.target.value)}
//                 className="mb-4 p-2 border rounded"
//             >
//                 <option value="daily">Daily</option>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//             </select>
//
//             {/* Sales and Purchases Chart */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                     <h2 className="text-xl mb-2">Sales Trends</h2>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <LineChart data={chartData}>
//                             <XAxis dataKey="label" />
//                             <YAxis />
//                             <Tooltip />
//                             <Legend />
//                             <Line type="monotone" dataKey="sales" stroke="#8884d8" />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//                 <div>
//                     <h2 className="text-xl mb-2">Purchases Trends</h2>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <BarChart data={chartData}>
//                             <XAxis dataKey="label" />
//                             <YAxis />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="purchases" fill="#82ca9d" />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default Dashboard;















// import  {useEffect, useState} from 'react';
//
// export function Dashboard() {
//     // const [_, setMessage] = useState("");
//     const [selectedMonth] = useState(new Date().getMonth() + 1);
//     const [selectedYear] = useState(new Date().getFullYear());
//     const [selectedData] = useState("amount");
//     //veruble to store and set transaction data formated for chart display
//     // const [transactionData, setTransactionData] = useState({});
//
//
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 // const transactionResponse = await ApiService.getAllTransactions();
//                 // if (transactionResponse.status === 200) {
//                 //     setTransactionData(
//                 //         transformTransactionData(
//                 //             transactionResponse.transactions,
//                 //             selectedMonth,
//                 //             selectedYear
//                 //         )
//                 //     );
//                 // }
//             } catch (error) {
//                 // showMessage(
//                 //   //  error.response?.data?.message || "Error Loggin in a User: " + error
//                 // );
//             }
//         };
//         fetchData();
//     }, [selectedMonth, selectedYear, selectedData]);
//
//
//     // const showMessage = (msg:any) => {
//     //     setMessage(msg);
//     //     setTimeout(() => {
//     //         setMessage("");
//     //     }, 4000);
//     // };
//
//     return (
//   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
// Dashboard
//   </div>
//     );
// }


// import './dashboard.css'; // Make sure to create this CSS file
//
// const Dashboard = () => {
//     return (
//         <div className="dashboard-container">
//             {/* Top Cards Section */}
//             <div className="top-cards">
//                 <div className="card">
//                     <div className="card-header">
//                         <span className="card-title">$120,369</span>
//                         <span className="card-subtitle">Active Deal</span>
//                     </div>
//                     <div className="card-footer">
//                         <span className="positive">+20%</span>
//                         <span className="from-last-month">From last month</span>
//                     </div>
//                 </div>
//
//                 <div className="card">
//                     <div className="card-header">
//                         <span className="card-title">$234,210</span>
//                         <span className="card-subtitle">Revenue Total</span>
//                     </div>
//                     <div className="card-footer">
//                         <span className="positive">+9.0%</span>
//                         <span className="from-last-month">From last month</span>
//                     </div>
//                 </div>
//
//                 <div className="card">
//                     <div className="card-header">
//                         <span className="card-title">874</span>
//                         <span className="card-subtitle">Closed Deals</span>
//                     </div>
//                     <div className="card-footer">
//                         <span className="negative">-4.5%</span>
//                         <span className="from-last-month">From last month</span>
//                     </div>
//                 </div>
//             </div>
//
//             {/* Main Content Section */}
//             <div className="main-content">
//                 {/* Statistics Card */}
//                 <div className="statistics-card">
//                     <div className="card-header">
//                         <span className="card-title">Statistics</span>
//                         <span className="card-subtitle">Target you've set for each month</span>
//                         <div className="time-filters">
//                             <button className="active">Monthly</button>
//                             <button>Quarterly</button>
//                             <button>Annually</button>
//                         </div>
//                     </div>
//                     <div className="stats-numbers">
//                         <div className="stat-item">
//                             <span className="stat-value">$212,142.12</span>
//                             <span className="positive">+23.2%</span>
//                             <span className="avg-text">Avg. Yearly Profit</span>
//                         </div>
//                         <div className="stat-item">
//                             <span className="stat-value">$30,321.23</span>
//                             <span className="negative">-2.3%</span>
//                             <span className="avg-text">Avg. Yearly Profit</span>
//                         </div>
//                     </div>
//                     <div className="chart-placeholder">
//                         {/* This would be where a charting library like Recharts or Chart.js would go */}
//                         <img src="https://i.ibb.co/L5Q2j80/Screenshot-2023-11-20-at-1-58-00-PM.png" alt="chart placeholder" />
//                     </div>
//                 </div>
//
//                 {/* Estimated Revenue Card */}
//                 <div className="estimated-revenue-card">
//                     <div className="card-header">
//                         <span className="card-title">Estimated Revenue</span>
//                         <span className="card-subtitle">Target you've set for each month</span>
//                         <div className="options-icon">⋮</div>
//                     </div>
//                     <div className="revenue-progress">
//                         <div className="progress-circle">
//                             <svg viewBox="0 0 36 36" className="circular-chart blue">
//                                 <path
//                                     className="circle-bg"
//                                     d="M18 2.0845
//                                     a 15.9155 15.9155 0 0 1 0 31.831
//                                     a 15.9155 15.9155 0 0 1 0 -31.831"
//                                 />
//                                 <path
//                                     className="circle"
//                                     strokeDasharray="70, 100"
//                                     d="M18 2.0845
//                                     a 15.9155 15.9155 0 0 1 0 31.831
//                                     a 15.9155 15.9155 0 0 1 0 -31.831"
//                                 />
//                             </svg>
//                             <div className="circle-text">
//                                 <span className="month-goals">June Goals</span>
//                                 <span className="goal-amount">$90</span>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="revenue-details">
//                         <div className="detail-item">
//                             <span className="category">Marketing</span>
//                             <span className="amount">$30,569.00</span>
//                             <div className="progress-bar-container">
//                                 <div className="progress-bar blue" style={{ width: '85%' }}></div>
//                                 <span className="percentage">85%</span>
//                             </div>
//                         </div>
//                         <div className="detail-item">
//                             <span className="category">Sales</span>
//                             <span className="amount">$20,486.00</span>
//                             <div className="progress-bar-container">
//                                 <div className="progress-bar purple" style={{ width: '55%' }}></div>
//                                 <span className="percentage">55%</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default Dashboard;