"use client";

// import { useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   useStripe,
//   useElements,
//   CardNumberElement,
//   CardExpiryElement,
//   CardCvcElement,
// } from "@stripe/react-stripe-js";
// import { CreditCard, Lock } from "lucide-react";

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// const ELEMENT_OPTIONS = {
//   style: {
//     base: {
//       color: "#1f2937", // Tailwind text-gray-900
//       fontSize: "16px",
//       fontFamily: "Inter, system-ui, sans-serif",
//       "::placeholder": { color: "#9ca3af" }, // Tailwind placeholder-gray-400
//     },
//     invalid: {
//       color: "#dc2626", // red-600
//     },
//   },
// };

// function CheckoutForm() {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [loading, setLoading] = useState(false);
//   const [name, setName] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;

//     setLoading(true);

//     const cardNumberElement = elements.getElement(CardNumberElement);

//     const { paymentMethod, error } = await stripe.createPaymentMethod({
//       type: "card",
//       card: cardNumberElement,
//       billing_details: { name, email: "customer@example.com" },
//     });

//     if (error) {
//       alert(error.message);
//       setLoading(false);
//       return;
//     }

//     const res = await fetch("http://localhost:3000/orders", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         order: { amount: 5000, currency: "usd" },
//         payment_method_id: paymentMethod.id,
//       }),
//     });

//     const data = await res.json();

//     if (data.requires_action) {
//       const { error: confirmError } = await stripe.confirmCardPayment(data.client_secret);
//       if (confirmError) alert("Payment failed: " + confirmError.message);
//       else alert("Payment succeeded after authentication!");
//     } else if (data.success) {
//       alert("Payment succeeded!");
//     } else {
//       alert("Payment failed: " + data.error);
//     }

//     setLoading(false);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg mx-auto" // removed shadow-md max-w-lg
//     >
//       <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>

//       {/* Card Number */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
//         <div className="relative">
//           <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <div className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
//             <CardNumberElement options={ELEMENT_OPTIONS} />
//           </div>
//         </div>
//       </div>

//       {/* Expiry & CVV */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
//           <div className="px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
//             <CardExpiryElement options={ELEMENT_OPTIONS} />
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
//           <div className="px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
//             <CardCvcElement options={ELEMENT_OPTIONS} />
//           </div>
//         </div>
//       </div>

//       {/* Name on Card */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card *</label>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="John Doe"
//           required
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
//         />
//       </div>

//       {/* Secure notice */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-center">
//           <Lock className="w-5 h-5 text-blue-600 mr-2" />
//           <span className="text-sm text-blue-800">
//             Your payment information is secure and encrypted
//           </span>
//         </div>
//       </div>

//       {/* Submit button */}
//       {/* <button
//         type="submit"
//         disabled={!stripe || loading}
//         className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//       >
//         {loading ? "Processing..." : "Pay $50"}
//       </button> */}
//     </form>
//   );
// }

// export default function StyledPaymentForm() {
//   return (
//     <Elements stripe={stripePromise}>
//       <CheckoutForm />
//     </Elements>
//   );
// }

import { forwardRef, useImperativeHandle, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock } from "lucide-react";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#1f2937", // Tailwind text-gray-900
      fontSize: "16px",
      fontFamily: "Inter, system-ui, sans-serif",
      "::placeholder": { color: "#9ca3af" }, // Tailwind placeholder-gray-400
    },
    invalid: {
      color: "#dc2626", // red-600
    },
  },
};
const PaymentInner = forwardRef((props, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    async createPaymentMethod() {
      if (!stripe || !elements) return null;
      if (!name.trim()) {
        toast.error("Please enter the name on the card.");
        return null;
      }
      setLoading(true);
      props.setStripeLoading?.(true); // notify parent
      try {
        const card = elements.getElement(CardNumberElement);
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: "card",
          card,
          billing_details: { name },
        });
        setLoading(false);
        props.setStripeLoading?.(false); // notify parent
        if (error) {
          // alert(error.message);
          toast.error(error.message);
          return null;
        }
        //   return paymentMethod.id;
        // return { name , id: paymentMethod.id}
        return paymentMethod || null; // ✅ always return something
      } finally {
        setLoading(false);
        props.setStripeLoading?.(false); // ✅ always reset
      }
    },
    isLoading: () => loading, // ✅ expose loading state
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Payment Information
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number *
        </label>
        <div className="relative border border-gray-300 rounded-lg px-4 py-3">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <div className="pl-8">
            <CardNumberElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-300 rounded-lg px-4 py-3">
          <CardExpiryElement options={ELEMENT_OPTIONS} />
        </div>
        <div className="border border-gray-300 rounded-lg px-4 py-3">
          <CardCvcElement options={ELEMENT_OPTIONS} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name on Card *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
        <Lock className="w-5 h-5 text-blue-600 mr-2" />
        <span className="text-sm text-blue-800">
          Your payment information is secure and encrypted
        </span>
      </div>

      {loading && <p className="text-sm text-blue-600">Saving payment info…</p>}
    </div>
  );
});
PaymentInner.displayName = "PaymentInner";

export default function PaymentStep(props, ref) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentInner ref={ref} {...props} />
    </Elements>
  );
}
