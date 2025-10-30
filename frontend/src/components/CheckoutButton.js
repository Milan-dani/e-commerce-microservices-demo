import { useCreateCheckoutSessionMutation } from "@/api/services/orderApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "./Button";
import { ArrowRight } from "lucide-react";

const CheckoutButton = ({ cartItems, shippingFee }) => {
  const [createOrder, { isLoading }] = useCreateCheckoutSessionMutation();
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      if (!cartItems?.items?.length) {
        toast.error("Your cart is empty!");
        return;
      }

      const order = await createOrder({
        items: cartItems?.items?.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
        shippingFee,
      }).unwrap();

      console.log("✅ Order created:", order);
      toast.success("Order placed successfully!");
      // ✅ redirect to checkout page (e.g. /checkout/[orderId])
      if (order.id) {        
        router.push(`/checkout/${order.id}`);
      }
    } catch (err) {
      console.error("❌ Failed to create order:", err);
      toast(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } flex items-center`}
          >
              <span >
                Failed to create order
              </span>
              <Button
                onClick={() => toast.dismiss(t.id)}
                className="ml-4"
              >
                Dismiss
              </Button>
          </div>
        ),
        { duration: Infinity }
      );

      //   toast.error("Failed to create order");
    }
  };

  return (
    <Button
      icon={ArrowRight}
      iconPosition="right"
      onClick={handleCheckout}
      disabled={isLoading}
      isLoading={isLoading}
      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-2"
    >
      {isLoading ? "Placing order..." : "Proceed to Checkout"}
    </Button>
  );
};

export default CheckoutButton;
