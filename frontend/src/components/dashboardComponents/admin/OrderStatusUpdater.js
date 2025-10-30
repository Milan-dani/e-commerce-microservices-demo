import { useUpdateOrderStatusMutation } from "@/api/services/orderApi";

const OrderStatusUpdater = ({ orderId }) => {
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
      alert(`Order marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="flex gap-2">
      {["pending", "paid", "shipped", "delivered", "cancelled"].map((status) => (
        <button
          key={status}
          disabled={isLoading}
          onClick={() => handleStatusChange(status)}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          {status}
        </button>
      ))}
    </div>
  );
};
 export default OrderStatusUpdater;