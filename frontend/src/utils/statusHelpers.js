import {
  CheckCircle,
  ClipboardCheck,
  Clock,
  CreditCard,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

export const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case "paid":
      return <CreditCard className="w-5 h-5 text-indigo-600" />;
    case "processing":
      return <Clock className="w-5 h-5 text-amber-500" />;
    case "shipped":
      return <Truck className="w-5 h-5 text-blue-600" />;
    case "delivered":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "cancelled":
      return <XCircle className="w-5 h-5 text-red-600" />;
    case "fulfilled":
      return <ClipboardCheck className="w-5 h-5 text-teal-600" />;
    default:
      return <Package className="w-5 h-5 text-gray-600" />;
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "paid":
      return "bg-indigo-100 text-indigo-800";
    case "processing":
      return "bg-amber-100 text-amber-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "fulfilled":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
