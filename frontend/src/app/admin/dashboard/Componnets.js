// // src/components/analytics/StatCard.jsx
// import { motion } from "framer-motion";

// export default function StatCard({ title, value, sub, icon: Icon, positive = true }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45 }}
//       className="bg-white rounded-lg shadow-sm p-6"
//     >
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600">{title}</p>
//           <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
//           {sub && (
//             <p className={`text-sm mt-2 ${positive ? "text-green-600" : "text-red-600"} flex items-center`}>
//               {sub}
//             </p>
//           )}
//         </div>
//         {Icon && <Icon className="w-8 h-8 text-gray-400" />}
//       </div>
//     </motion.div>
//   );
// }

// // src/components/analytics/ChartCard.jsx
// import { motion } from "framer-motion";

// export default function ChartCard({ title, subtitle, children }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45 }}
//       className="bg-white rounded-lg shadow-sm p-6"
//     >
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
//         </div>
//       </div>
//       <div>{children}</div>
//     </motion.div>
//   );
// }


// // pages/admin/analytics.jsx
// import React, { useMemo } from "react";
// import Link from "next/link";
// import dynamic from "next/dynamic";
// import { motion } from "framer-motion";
// import {
//   useGetOrdersAnalyticsQuery,
//   useGetRevenueAnalyticsQuery,
//   useGetUsersAnalyticsQuery,
//   useGetFunnelQuery,
//   useGetSummaryQuery,
//   useGetTrendsQuery,
//   useGetEventsQuery,
// } from "@/store/apis/analyticsApi";
// import StatCard from "@/components/analytics/StatCard";
// import ChartCard from "@/components/analytics/ChartCard";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import { DollarSign, Users, ShoppingCart, AlertTriangle } from "lucide-react";

// // Colors (from your guide)
// const COLORS = {
//   blue: "#2563EB",
//   green: "#10B981",
//   orange: "#F59E0B",
//   red: "#EF4444",
//   gray: "#9CA3AF",
// };

// export default function AdminAnalyticsPage() {
//   // fetch data
//   const { data: ordersData, isLoading: loadingOrders } = useGetOrdersAnalyticsQuery();
//   const { data: revenueData, isLoading: loadingRevenue } = useGetRevenueAnalyticsQuery();
//   const { data: usersData, isLoading: loadingUsers } = useGetUsersAnalyticsQuery();
//   const { data: funnelData, isLoading: loadingFunnel } = useGetFunnelQuery();
//   const { data: summaryData, isLoading: loadingSummary } = useGetSummaryQuery();
//   const { data: trendsData, isLoading: loadingTrends } = useGetTrendsQuery();
//   const { data: eventsData, isLoading: loadingEvents } = useGetEventsQuery({ limit: 100 });

//   // derived KPI values with safe guards
//   const kpi = {
//     ordersCreated: ordersData?.orders_created ?? 0,
//     ordersPlaced: ordersData?.orders_placed ?? 0,
//     totalRevenue: revenueData?.total_revenue ?? 0,
//     transactions: revenueData?.transactions ?? 0,
//     newUsers: usersData?.new_users ?? 0,
//     activeLogins: usersData?.active_logins ?? 0,
//     funnel: funnelData ?? { viewed: 0, added_to_cart: 0, orders_placed: 0, conversion_rate: "0%" },
//   };

//   // transform trends for recharts
//   // trends coming as [{ _id: { event, day }, count, totalRevenue }]
//   const trendSeries = useMemo(() => {
//     if (!trendsData || !Array.isArray(trendsData)) return [];
//     // group by day
//     const map = {};
//     trendsData.forEach((r) => {
//       const day = r._id?.day || r.day || "";
//       if (!map[day]) map[day] = { day };
//       const event = r._id?.event || r._id;
//       if (r.count != null) map[day][event] = r.count;
//       if (r.totalRevenue != null) {
//         // coerce strings if necessary
//         const rev = typeof r.totalRevenue === "string" ? parseFloat(r.totalRevenue) : r.totalRevenue;
//         map[day].revenue = (map[day].revenue || 0) + (rev || 0);
//       }
//     });
//     return Object.values(map).sort((a, b) => (a.day > b.day ? 1 : -1));
//   }, [trendsData]);

//   // transform summary for bar chart
//   const summaryChartData = useMemo(() => {
//     if (!summaryData || !Array.isArray(summaryData)) return [];
//     return summaryData.map((s) => ({
//       event: s._id,
//       count: s.count,
//       last: s.last,
//     }));
//   }, [summaryData]);

//   // payment success vs failed counts from summary
//   const paymentCounts = useMemo(() => {
//     const failed = summaryData?.find((s) => s._id === "payment.failed")?.count ?? 0;
//     const success = summaryData?.find((s) => s._id === "payment.success")?.count ?? 0;
//     return [
//       { name: "Success", value: success },
//       { name: "Failed", value: failed },
//     ];
//   }, [summaryData]);

//   // top failure reasons (from events)
//   const failureReasons = useMemo(() => {
//     if (!eventsData || !Array.isArray(eventsData)) return [];
//     const reasons = {};
//     eventsData.forEach((e) => {
//       if (e.event === "payment.failed") {
//         const reason = e.payload?.reason || "unknown";
//         reasons[reason] = (reasons[reason] || 0) + 1;
//       }
//     });
//     return Object.entries(reasons)
//       .map(([reason, count]) => ({ reason, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 6);
//   }, [eventsData]);

//   // helpers
//   const formatCurrency = (v) => {
//     const n = typeof v === "string" ? parseFloat(v) || 0 : v || 0;
//     return n.toLocaleString(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 2 });
//   };

//   const loading = loadingOrders || loadingRevenue || loadingUsers || loadingFunnel || loadingSummary || loadingTrends || loadingEvents;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
//               <p className="text-gray-600 mt-2">Realtime operational and business metrics</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <Link href="/admin/dashboard">
//                 <a className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50">Back to Admin</a>
//               </Link>
//             </div>
//           </div>
//         </motion.div>

//         {/* Top KPIs */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//           <StatCard title="Total Revenue" value={formatCurrency(kpi.totalRevenue)} sub={`${kpi.transactions} transactions`} icon={DollarSign} />
//           <StatCard title="Orders Created" value={kpi.ordersCreated} sub={`Placed: ${kpi.ordersPlaced}`} icon={ShoppingCart} />
//           <StatCard title="New Users" value={kpi.newUsers} sub={`Active logins: ${kpi.activeLogins}`} icon={Users} />
//           <StatCard title="Conversion Rate" value={kpi.funnel.conversion_rate ?? "0%"} sub={`${kpi.funnel.orders_placed ?? 0} orders`} icon={AlertTriangle} />
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//           {/* Trends (big) */}
//           <div className="lg:col-span-2">
//             <ChartCard title="Daily Trends" subtitle="Orders / Payments / Signups (per day)">
//               <div className="h-64">
//                 {trendSeries.length ? (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={trendSeries}>
//                       <XAxis dataKey="day" tick={{ fill: "#6B7280" }} />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       {/* include most common events if present */}
//                       <Line type="monotone" dataKey="order.placed" name="Orders Placed" stroke={COLORS.blue} />
//                       <Line type="monotone" dataKey="payment.success" name="Payments" stroke={COLORS.green} />
//                       <Line type="monotone" dataKey="user.signup" name="User Signups" stroke={COLORS.orange} />
//                       {/* revenue (if present) */}
//                       <Line type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.gray} strokeDasharray="3 3" />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
//                     <p className="text-gray-500">No trend data available</p>
//                   </div>
//                 )}
//               </div>
//             </ChartCard>
//           </div>

//           {/* Payments success vs failure */}
//           <ChartCard title="Payments: Success vs Failed" subtitle="Quick health check">
//             <div className="h-64">
//               {paymentCounts.reduce((s, p) => s + p.value, 0) ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={paymentCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
//                       <Cell fill={COLORS.green} />
//                       <Cell fill={COLORS.red} />
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
//                   <p className="text-gray-500">No payment events yet</p>
//                 </div>
//               )}
//             </div>
//           </ChartCard>
//         </div>

//         {/* Event summary + Funnel + Failure reasons */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//           <div className="lg:col-span-2">
//             <ChartCard title="Event Summary" subtitle="Counts by event type">
//               <div className="h-56">
//                 {summaryChartData.length ? (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={summaryChartData}>
//                       <XAxis dataKey="event" tick={{ fill: "#6B7280" }} />
//                       <YAxis />
//                       <Tooltip />
//                       <Bar dataKey="count" name="Count" fill={COLORS.blue} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
//                     <p className="text-gray-500">No summary data</p>
//                   </div>
//                 )}
//               </div>
//             </ChartCard>
//           </div>

//           <ChartCard title="Conversion Funnel" subtitle="Viewed → Cart → Orders">
//             <div className="space-y-3">
//               <div>
//                 <div className="flex justify-between text-sm text-gray-600 mb-1">
//                   <span>Viewed</span>
//                   <span>{kpi.funnel.viewed ?? 0}</span>
//                 </div>
//                 <div className="w-full bg-gray-100 rounded-full h-3">
//                   <div
//                     className="h-3 rounded-full"
//                     style={{
//                       width: `${kpi.funnel.viewed ? 100 : 0}%`,
//                       background: "linear-gradient(90deg,#60a5fa,#2563eb)",
//                     }}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm text-gray-600 mb-1">
//                   <span>Added to Cart</span>
//                   <span>{kpi.funnel.added_to_cart ?? 0}</span>
//                 </div>
//                 <div className="w-full bg-gray-100 rounded-full h-3">
//                   <div
//                     className="h-3 rounded-full"
//                     style={{
//                       width: `${kpi.funnel.viewed ? Math.min(((kpi.funnel.added_to_cart || 0) / (kpi.funnel.viewed || 1)) * 100, 100) : 0}%`,
//                       background: "linear-gradient(90deg,#34d399,#10b981)",
//                     }}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm text-gray-600 mb-1">
//                   <span>Orders Placed</span>
//                   <span>{kpi.funnel.orders_placed ?? 0}</span>
//                 </div>
//                 <div className="w-full bg-gray-100 rounded-full h-3">
//                   <div
//                     className="h-3 rounded-full"
//                     style={{
//                       width: `${kpi.funnel.viewed ? Math.min(((kpi.funnel.orders_placed || 0) / (kpi.funnel.viewed || 1)) * 100, 100) : 0}%`,
//                       background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
//                     }}
//                   />
//                 </div>
//               </div>

//               <p className="text-sm text-gray-500 mt-2">Conversion Rate: {kpi.funnel.conversion_rate ?? "0%"}</p>
//             </div>
//           </ChartCard>
//         </div>

//         {/* Failure reasons + Recent events table */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="col-span-1">
//             <ChartCard title="Top Payment Failure Reasons" subtitle="Quick triage">
//               <div className="space-y-3">
//                 {failureReasons.length ? (
//                   failureReasons.map((f) => (
//                     <div key={f.reason} className="flex items-center justify-between">
//                       <div className="text-sm text-gray-700 truncate pr-4">{f.reason}</div>
//                       <div className="text-sm text-gray-600 font-medium">{f.count}</div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-500">No failures recorded</p>
//                 )}
//               </div>
//             </ChartCard>
//           </div>

//           <div className="lg:col-span-2">
//             <ChartCard title="Recent Events" subtitle="Last 100 events">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm text-left">
//                   <thead>
//                     <tr className="text-gray-600">
//                       <th className="px-3 py-2">Event</th>
//                       <th className="px-3 py-2">Source</th>
//                       <th className="px-3 py-2">Entity</th>
//                       <th className="px-3 py-2">Amount</th>
//                       <th className="px-3 py-2">Time</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {eventsData && eventsData.length ? (
//                       eventsData.map((e) => {
//                         const amount = e.payload?.amount ?? null;
//                         const entity = e.payload?.orderId ?? e.payload?.userId ?? "-";
//                         return (
//                           <tr key={e._id} className="border-t">
//                             <td className="px-3 py-2 text-gray-800 font-medium">{e.event}</td>
//                             <td className="px-3 py-2 text-gray-600">{e.source}</td>
//                             <td className="px-3 py-2 text-gray-600 truncate max-w-[220px]">{entity}</td>
//                             <td className="px-3 py-2 text-gray-700">{amount ? formatCurrency(amount) : "-"}</td>
//                             <td className="px-3 py-2 text-gray-500">{new Date(e.timestamp).toLocaleString()}</td>
//                           </tr>
//                         );
//                       })
//                     ) : (
//                       <tr>
//                         <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
//                           No events
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </ChartCard>
//           </div>
//         </div>

//         {/* Loading overlay */}
//         {loading && (
//           <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
//             <div className="bg-white/80 p-6 rounded-lg shadow-lg">
//               <p className="text-gray-700">Loading analytics…</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// /app/admin/analytics/page.js

// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { motion } from "framer-motion";
// import { DateRange } from "react-date-range";
// import { addDays, format } from "date-fns";
// import { useGetAnalyticsQuery } from "@/store/slices/analyticsApi";
// import { debounce } from "lodash";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
// } from "recharts";
// import { TrendingUp, Users, ShoppingCart, DollarSign, Activity } from "lucide-react";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";
// import Button from "@/components/Button";

// const eventOptions = [
//   { label: "All Events", value: "" },
//   { label: "Orders", value: "orders" },
//   { label: "Payments", value: "payments" },
//   { label: "Customers", value: "customers" },
// ];

// export default function AdminAnalyticsPage() {
//   const [eventType, setEventType] = useState("");
//   const [dateRange, setDateRange] = useState([
//     {
//       startDate: addDays(new Date(), -7),
//       endDate: new Date(),
//       key: "selection",
//     },
//   ]);
//   const [queryParams, setQueryParams] = useState({
//     startDate: format(addDays(new Date(), -7), "yyyy-MM-dd"),
//     endDate: format(new Date(), "yyyy-MM-dd"),
//     eventType: "",
//   });

//   // Debounced query update
//   const updateQuery = useMemo(
//     () =>
//       debounce((range, type) => {
//         setQueryParams({
//           startDate: format(range[0].startDate, "yyyy-MM-dd"),
//           endDate: format(range[0].endDate, "yyyy-MM-dd"),
//           eventType: type,
//         });
//       }, 500),
//     []
//   );

//   useEffect(() => {
//     updateQuery(dateRange, eventType);
//   }, [dateRange, eventType, updateQuery]);

//   const { data, isLoading } = useGetAnalyticsQuery(queryParams);

//   const stats = data?.summary || {
//     revenue: 12450.75,
//     orders: 842,
//     customers: 394,
//     avgOrder: 48.3,
//     conversionRate: 5.7,
//   };

//   const chartData = data?.chart || [
//     { date: "Mon", revenue: 1200, orders: 20 },
//     { date: "Tue", revenue: 2100, orders: 25 },
//     { date: "Wed", revenue: 1800, orders: 22 },
//     { date: "Thu", revenue: 2400, orders: 27 },
//     { date: "Fri", revenue: 2000, orders: 24 },
//     { date: "Sat", revenue: 2500, orders: 29 },
//     { date: "Sun", revenue: 1700, orders: 18 },
//   ];

//   const pieData = [
//     { name: "Completed", value: 68 },
//     { name: "Pending", value: 22 },
//     { name: "Failed", value: 10 },
//   ];
//   const COLORS = ["#2563EB", "#FACC15", "#EF4444"];

//   return (
//     <div className="min-h-screen bg-gray-50 px-6 py-8">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="flex flex-col sm:flex-row items-center justify-between gap-4"
//         >
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
//             <p className="text-gray-600 mt-1">Insights and performance metrics</p>
//           </div>
//         </motion.div>

//         {/* Filters */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.1 }}
//           className="bg-white shadow-sm rounded-lg p-6 flex flex-col lg:flex-row gap-6"
//         >
//           <div>
//             <h3 className="text-sm font-medium text-gray-700 mb-2">Select Date Range</h3>
//             <DateRange
//               editableDateInputs
//               onChange={(item) => setDateRange([item.selection])}
//               moveRangeOnFirstSelection={false}
//               ranges={dateRange}
//               rangeColors={["#2563EB"]}
//             />
//           </div>

//           <div className="flex-1">
//             <label className="text-sm font-medium text-gray-700 mb-2 block">
//               Event Type
//             </label>
//             <select
//               className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
//               value={eventType}
//               onChange={(e) => setEventType(e.target.value)}
//             >
//               {eventOptions.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </motion.div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
//           <SummaryCard
//             icon={DollarSign}
//             title="Revenue"
//             value={`$${stats.revenue.toLocaleString()}`}
//             color="text-green-600"
//           />
//           <SummaryCard
//             icon={ShoppingCart}
//             title="Orders"
//             value={stats.orders.toLocaleString()}
//             color="text-blue-600"
//           />
//           <SummaryCard
//             icon={Users}
//             title="Customers"
//             value={stats.customers.toLocaleString()}
//             color="text-purple-600"
//           />
//           <SummaryCard
//             icon={TrendingUp}
//             title="Conversion"
//             value={`${stats.conversionRate}%`}
//             color="text-orange-600"
//           />
//           <SummaryCard
//             icon={Activity}
//             title="Avg Order"
//             value={`$${stats.avgOrder}`}
//             color="text-yellow-500"
//           />
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="bg-white p-6 rounded-lg shadow-sm"
//           >
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Revenue & Orders Trend
//             </h3>
//             <ResponsiveContainer width="100%" height={280}>
//               <BarChart data={chartData}>
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
//                 <Bar dataKey="orders" fill="#9333EA" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.1 }}
//             className="bg-white p-6 rounded-lg shadow-sm"
//           >
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h3>
//             <ResponsiveContainer width="100%" height={280}>
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   dataKey="value"
//                   nameKey="name"
//                   innerRadius={60}
//                   outerRadius={100}
//                   paddingAngle={4}
//                 >
//                   {pieData.map((_, i) => (
//                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // 🔹 Summary Card Component
// const SummaryCard = ({ icon: Icon, title, value, color }) => (
//   <motion.div
//     whileHover={{ scale: 1.02 }}
//     className="bg-white p-6 rounded-lg shadow-sm flex flex-col"
//   >
//     <div className="flex items-center justify-between mb-2">
//       <p className="text-sm font-medium text-gray-600">{title}</p>
//       <Icon className={`w-6 h-6 ${color}`} />
//     </div>
//     <p className="text-2xl font-bold text-gray-900">{value}</p>
//   </motion.div>
// );

// Step 4 — Update your Sidebar Tabs

// In your existing dashboard sidebar list, just add:
// { id: "analytics", name: "Analytics", icon: PieChart },