"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetOrderQuery,
  useUpdateShippingInfoMutation,
  useUpdatePaymentInfoMutation,
  usePlaceOrderMutation,
} from "@/api/services/orderApi";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const {orderId} = useParams();
  const router = useRouter();
  const { data: order } = useGetOrderQuery(orderId);
  const [currentStep, setCurrentStep] = useState(1);

  const [updateShippingInfo] = useUpdateShippingInfoMutation();
  const [updatePaymentInfo] = useUpdatePaymentInfoMutation();
  const [placeOrder] = usePlaceOrderMutation();

  const [shippingInfo, setShippingInfo] = useState(order?.shippingInfo || {});
  const [paymentInfo, setPaymentInfo] = useState(order?.paymentInfo || {});

  if (!order) return <p>Loading...</p>;

  const handleNextStep = async () => {
    if (currentStep === 1) {
      await updateShippingInfo({ orderId, shippingInfo }).unwrap();
      setCurrentStep(2);
    } else if (currentStep === 2) {
      await updatePaymentInfo({ orderId, paymentInfo }).unwrap();
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    const order =await placeOrder(orderId).unwrap();
     if (order.status === "paid") {
          router.push(`/orders/${orderId}`); // redirect to order confirmation
      } else if (order.status === "pending" && order.paymentInfo.status === "failed") {
        // redirect to payment retry page
        toast.error("Payment failed. Please retry.");
      }
  };

  return (
    <div>
      <h2>Checkout Step {currentStep}</h2>
      {currentStep === 1 && (
        <div>
          {/* shipping form inputs */}
          <input placeholder="Name" value={shippingInfo.name || ""} onChange={e => setShippingInfo({ ...shippingInfo, name: e.target.value })} />
          <input placeholder="Address" value={shippingInfo.address || ""} onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })} />
          <button onClick={handleNextStep}>Next</button>
        </div>
      )}
      {currentStep === 2 && (
        <div>
          {/* payment form inputs */}
          <input placeholder="Card Number" value={paymentInfo.cardNumber || ""} onChange={e => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })} />
          <input placeholder="CVV" value={paymentInfo.cvv || ""} onChange={e => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })} />
          <button onClick={handleNextStep}>Next</button>
        </div>
      )}
      {currentStep === 3 && (
        <div>
          <h3>Review Order</h3>
          <pre>{JSON.stringify(order, null, 2)}</pre>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      )}
    </div>
  );
}
