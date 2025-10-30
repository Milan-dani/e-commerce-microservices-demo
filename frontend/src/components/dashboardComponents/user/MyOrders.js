
const { useListOrdersQuery } = require("@/api/services/orderApi");

const MyOrders = () => {
  const { data: orders, isLoading, isError } = useListOrdersQuery();

  if (isLoading) return <p>Loading your orders...</p>;
  if (isError) return <p>Error loading orders</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      {orders?.length ? (
        orders.map((order) => (
          <div key={order.id} className="p-4 border rounded mb-3 shadow">
            <p>🆔 Order ID: {order.id}</p>
            <p>📦 Items: {order.items.length}</p>
            <p>💰 Total: ₹{order.total}</p>
            <p>🚚 Status: {order.status}</p>
          </div>
        ))
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};
