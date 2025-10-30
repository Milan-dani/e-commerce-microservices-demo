"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CreditCard, MapPin, User, Lock, ArrowLeft, Check } from "lucide-react";
import {
  useGetOrderQuery,
  useUpdateShippingInfoMutation,
  useUpdatePaymentInfoMutation,
  usePlaceOrderMutation,
} from "@/api/services/orderApi";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { validateCheckoutForm } from "@/utils/formValidation";
import Button from "@/components/Button";
import PaymentForm from "./paymentForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ResourceNotFound } from "@/components/ResourceNotFound";
import Image from "next/image";

export default function Checkout() {
  const { orderId } = useParams();
  const router = useRouter();
  const paymentRef = useRef();
  const { data: order, isLoading, isError } = useGetOrderQuery(orderId);

  useEffect(() => {
    if (!orderId) {
      router.push("/cart");
      toast.error("No order found. Please start from the cart.");
    } else if (order && order.status === "paid") {
      router.push(`/orders/${orderId}`);
      toast.success("Order already paid. Redirecting to order details.");
    } else if (
      order &&
      order.status === "pending" &&
      order.paymentInfo?.status === "failed"
    ) {
      toast.error("Payment failed. Please retry.");
    } // else remain on the page to complete checkout
  }, [orderId, order, router]);

  const [updateShippingInfo] = useUpdateShippingInfoMutation();
  const [updatePaymentInfo] = useUpdatePaymentInfoMutation();
  const [placeOrder, { isLoading: placeOrderLoading }] =
    usePlaceOrderMutation();

  const dummyData = {
    shippingInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "1234567890",
      address: "123 Main Street, Apartment 4B",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
    },
    paymentInfo: {
      cardNumber: "4111111111111111",
      expiryDate: "12/25",
      cvv: "123",
      cardName: "John Doe",
    },
    shippingMethod: "standard",
    paymentMethod: "card",
  };
  const [currentStep, setCurrentStep] = useState(1);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingInfo: {
      // Shipping Information
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
    paymentInfo: {
      // Payment Information
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardName: "",
    },

    // Order
    shippingMethod: "standard",
    paymentMethod: "card",
    // ...dummyData, // Dummy data for testing
  });

  const [errors, setErrors] = useState({});

  const handleChange_Old = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleChange = (step, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value,
      },
    }));
    setErrors((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: "",
      },
    }));
  };

  const handleNext_WithoutStipe = async () => {
    if (currentStep < 3) {
      // Validate form for the current step
      const newErrors = validateCheckoutForm(formData, currentStep);
      setErrors(newErrors); // always update errors

      // Check if there are any errors for the current step
      let stepHasErrors = false;

      if (currentStep === 1) {
        stepHasErrors = Object.keys(newErrors.shippingInfo || {}).length > 0;
      } else if (currentStep === 2) {
        stepHasErrors = Object.keys(newErrors.paymentInfo || {}).length > 0;
      }

      // If no errors, go to next step
      if (!stepHasErrors) {
        setErrors({});
        try {
          if (currentStep === 1) {
            const shippingInfo = { ...formData.shippingInfo };
            await updateShippingInfo({ orderId, shippingInfo }).unwrap();
            toast.success("Shipping information updated");
          } else if (currentStep === 2) {
            const paymentInfo = { ...formData.paymentInfo };
            await updatePaymentInfo({ orderId, paymentInfo }).unwrap();
            toast.success("Payment information updated");
          }
        } catch (err) {
          console.log("Errors found:", err);
          toast.error("Something went wrong. please try again.");
        }
        setCurrentStep((prev) => prev + 1);
      } else {
        console.log("Errors found:", newErrors);
        setErrors(newErrors);
      }
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      // Validate form for the current step
      const newErrors = validateCheckoutForm(formData, currentStep);
      setErrors(newErrors);

      let stepHasErrors = false;
      if (currentStep === 1) {
        stepHasErrors = Object.keys(newErrors.shippingInfo || {}).length > 0;
      } else if (currentStep === 2) {
        stepHasErrors = Object.keys(newErrors.paymentInfo || {}).length > 0;
      }

      if (stepHasErrors) {
        console.log("Errors found:", newErrors);
        setErrors(newErrors);
        return; // ❗ stop if validation fails
      }

      try {
        if (currentStep === 1) {
          const shippingInfo = { ...formData.shippingInfo };
          await updateShippingInfo({ orderId, shippingInfo }).unwrap();
          toast.success("Shipping information updated");
          setCurrentStep((prev) => prev + 1);
        } else if (currentStep === 2) {
          // ✅ Ask Stripe form to validate itself
          const paymentMethod = await paymentRef.current?.createPaymentMethod();
          console.log("Stripe result:", paymentMethod);

          // If Stripe returns null or has no id, stop progression
          if (!paymentMethod || !paymentMethod.id) {
            toast.error(
              "Payment verification failed. Please check your card details."
            );
            return; // ❗ stop here, don't go to next step
          }

          // If successful, save payment info
          setFormData((prev) => ({
            ...prev,
            paymentInfo: {
              ...prev.paymentInfo,
              paymentMethod,
            },
          }));

          const paymentInfo = { ...paymentMethod };
          await updatePaymentInfo({ orderId, paymentInfo }).unwrap();
          toast.success("Payment information updated");

          // ✅ Only advance if everything succeeded
          setCurrentStep((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Error during step", currentStep, err);
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  // const handleNextStep = async () => {
  //   if (currentStep === 1) {
  //     await updateShippingInfo({ orderId, shippingInfo }).unwrap();
  //     setCurrentStep(2);
  //   } else if (currentStep === 2) {
  //     await updatePaymentInfo({ orderId, paymentInfo }).unwrap();
  //     setCurrentStep(3);
  //   }
  // };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Handle order submission
  //   console.log('Order submitted:', formData);
  // };
  const handlePlaceOrder = async () => {
    const order = await placeOrder(orderId).unwrap();
    console.log(order);

    if (order.success === true) {
      if (order.order.status === "paid") {
        toast.success("Order placed successfully!");
        router.push(`/orders/${orderId}`);
      } else if (
        order.order.status === "pending" &&
        order.order.paymentInfo?.status === "failed"
      ) {
        toast.error("Payment failed. Please retry.");
      }
    } else {
      toast.error(order?.message || "Payment failed");
    }
  };

  const [items, setItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setSubTotal(order.subtotal || 0);
      setShippingFee(order.shippingFee || 0);
      setTotal(order.total || 0);
      setFormData((prev) => ({
        ...prev,
        shippingInfo: { ...prev.shippingInfo, ...order.shippingInfo },
        paymentInfo: { ...order.paymentInfo, ...order.paymentInfo },
      }));
      if (order.status === "failed") {
        setCurrentStep(1);
      } else {
        setCurrentStep(parseInt(order.currentStep) || 1);
      }
    }
  }, [order]);

  // const subtotal = orderItems.reduce(
  //   (total, item) => total + item.price * item.quantity,
  //   0
  // );
  // const shipping = formData.shippingMethod === "express" ? 15.99 : 9.99;
  // const tax = subtotal * 0.08;
  // const total = subtotal + shipping + tax;

  const steps = [
    { id: 1, name: "Shipping", icon: MapPin },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: Check },
  ];

  if (isLoading) return <LoadingSpinner />;
  // if (!order) return <p>Loading...</p>;
  if (isError)
    return (
      <ResourceNotFound
        message="Orders Could not be loaded."
        subtext="there is some issues and Orders could not be loaded."
        actionLabel="Back to Orders"
        route={"/orders"}
        resourceType={"order"}
      />
    );
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/cart">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Cart
              </motion.button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`ml-3 text-sm font-medium ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-4 ${
                        isCompleted ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.shippingInfo?.firstName}
                        onChange={(e) =>
                          handleChange(
                            "shippingInfo",
                            "firstName",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      {errors.shippingInfo?.firstName && (
                        <p className="text-sm text-red-400">
                          {errors.shippingInfo?.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.shippingInfo?.lastName}
                        onChange={(e) =>
                          handleChange(
                            "shippingInfo",
                            "lastName",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      {errors.shippingInfo?.lastName && (
                        <p className="text-sm text-red-400">
                          {errors.shippingInfo?.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.shippingInfo?.email}
                      onChange={(e) =>
                        handleChange("shippingInfo", "email", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    {errors.shippingInfo?.email && (
                      <p className="text-sm text-red-400">
                        {errors.shippingInfo?.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.shippingInfo?.phone}
                      onChange={(e) =>
                        handleChange("shippingInfo", "phone", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    {errors.shippingInfo?.phone && (
                      <p className="text-sm text-red-400">
                        {errors.shippingInfo?.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.shippingInfo?.address}
                      onChange={(e) =>
                        handleChange("shippingInfo", "address", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    {errors.shippingInfo?.address && (
                      <p className="text-sm text-red-400">
                        {errors.shippingInfo?.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.shippingInfo?.city}
                        onChange={(e) =>
                          handleChange("shippingInfo", "city", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      {errors.shippingInfo?.city && (
                        <p className="text-sm text-red-400">
                          {errors.shippingInfo?.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        name="state"
                        required
                        value={formData.shippingInfo?.state}
                        onChange={(e) =>
                          handleChange("shippingInfo", "state", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      >
                        <option value="">Select State</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                      </select>
                      {errors.shippingInfo?.state && (
                        <p className="text-sm text-red-400">
                          {errors.shippingInfo?.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.shippingInfo?.zipCode}
                        onChange={(e) =>
                          handleChange(
                            "shippingInfo",
                            "zipCode",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      {errors.shippingInfo?.zipCode && (
                        <p className="text-sm text-red-400">
                          {errors.shippingInfo?.zipCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {currentStep === "2" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Payment Information
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="cardNumber"
                        required
                        value={formData.paymentInfo?.cardNumber}
                        onChange={(e) =>
                          handleChange(
                            "paymentInfo",
                            "cardNumber",
                            e.target.value
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      {errors.paymentInfo?.cardNumber && (
                        <p className="text-sm text-red-400">
                          {errors.paymentInfo?.cardNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        required
                        value={formData.paymentInfo?.expiryDate}
                        onChange={(e) =>
                          handleChange(
                            "paymentInfo",
                            "expiryDate",
                            e.target.value
                          )
                        }
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      {errors.paymentInfo?.expiryDate && (
                        <p className="text-sm text-red-400">
                          {errors.paymentInfo?.expiryDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        required
                        value={formData.paymentInfo?.cvv}
                        onChange={(e) =>
                          handleChange("paymentInfo", "cvv", e.target.value)
                        }
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      {errors.paymentInfo?.cvv && (
                        <p className="text-sm text-red-400">
                          {errors.paymentInfo?.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      required
                      value={formData.paymentInfo?.cardName}
                      onChange={(e) =>
                        handleChange("paymentInfo", "cardName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    {errors.paymentInfo?.cardName && (
                      <p className="text-sm text-red-400">
                        {errors.paymentInfo?.cardName}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Your payment information is secure and encrypted
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* testing Stripe Payment */}
              {currentStep === 2 && (
                <PaymentForm
                  ref={paymentRef}
                  setStripeLoading={setStripeLoading}
                />
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Review Your Order
                  </h2>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Shipping Address
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900">
                        {formData.shippingInfo?.firstName}{" "}
                        {formData.shippingInfo?.lastName}
                      </p>
                      <p className="text-gray-600">
                        {formData.shippingInfo?.address}
                      </p>
                      <p className="text-gray-600">
                        {formData.shippingInfo?.city},{" "}
                        {formData.shippingInfo?.state}{" "}
                        {formData.shippingInfo?.zipCode}
                      </p>
                      <p className="text-gray-600">
                        {formData.shippingInfo?.email}
                      </p>
                      <p className="text-gray-600">
                        {formData.shippingInfo?.phone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Payment Method
                    </h3>

                    {formData?.paymentInfo?.paymentMethod?.card ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900">
                          <strong>Card:</strong>{" "}
                          {formData?.paymentInfo?.paymentMethod?.card.brand.toUpperCase()}{" "}
                          ••••{" "}
                          {formData?.paymentInfo?.paymentMethod?.card.last4}
                        </p>
                        <p className="text-gray-600">
                          <strong>Name:</strong>{" "}
                          {
                            formData?.paymentInfo?.paymentMethod
                              ?.billing_details?.name
                          }
                        </p>
                        <p className="text-gray-600">
                          <strong>Expiry:</strong>{" "}
                          {formData?.paymentInfo?.paymentMethod?.card.exp_month}
                          /{formData?.paymentInfo?.paymentMethod?.card.exp_year}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No payment info available.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  // <motion.button
                  //   whileHover={{ scale: 1.05 }}
                  //   whileTap={{ scale: 0.95 }}
                  //   type="button"
                  //   onClick={handlePrevious}
                  //   className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  // >
                  //   Previous
                  // </motion.button>
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </Button>
                )}

                <div className="ml-auto">
                  {currentStep < 3 ? (
                    // <motion.button
                    //   whileHover={{ scale: 1.05 }}
                    //   whileTap={{ scale: 0.95 }}
                    //   type="button"
                    //   onClick={handleNext}
                    //   disabled={currentStep === 2 && stripeLoading}
                    //   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    // >
                    //   Next
                    // </motion.button>
                    <Button
                      onClick={handleNext}
                      disabled={currentStep === 2 && stripeLoading}
                      isLoading={currentStep === 2 && stripeLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </Button>
                  ) : (
                    // <motion.button
                    //   whileHover={{ scale: 1.05 }}
                    //   whileTap={{ scale: 0.95 }}
                    //   type="submit"
                    //   onClick={handlePlaceOrder}
                    //   disabled={placeOrderLoading}
                    //   className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    // >
                    //   Place Order
                    // </motion.button>
                    <Button
                      onClick={handlePlaceOrder}
                      isLoading={placeOrderLoading}
                      disabled={placeOrderLoading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Place Order
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {item?.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                          sizes="64px"
                          unoptimized
                        />
                      ) : (
                        <CreditCard className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ${parseFloat(subTotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {parseInt(shippingFee) === 0
                      ? "Free"
                      : `$${parseFloat(shippingFee).toFixed(2)}`}
                  </span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-900">
                    ${tax.toFixed(2)}
                  </span>
                </div> */}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-600">Total</span>
                    <span className="text-gray-900">
                      ${parseFloat(total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">
                    Secure checkout with SSL encryption
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
