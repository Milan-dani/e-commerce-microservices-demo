import { motion } from "framer-motion";
import {
  Box,
  BoxIcon,
  ClipboardList,
  Package,
  PackagePlus,
  PackageSearch,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

const ResourceIcon = ({
  resourceType = "product",
  className = "",
  ...props
}) => {
  let Comp;
  switch (resourceType) {
    case "product":
      //   Comp = Box;
      Comp = PackageSearch;
      break;
    case "order":
      //   Comp = Package;
      Comp = ClipboardList;
      break;
    case "cart":
      //   Comp = Box;
      Comp = ShoppingCart;
      break;

    default:
      Comp = BoxIcon;
      break;
  }

  return <Comp className={className} />;
};

export const EmptyState = ({
  //   // message = "Not found.", item
  message,
  subtext,
  actionLabel,
  onAction,
  route,
  resourceType, // to show icon accordingly
}) => {
  return (
    <>
      {/* <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-gray-50" // changed min-h-[60vh] to min-h-screen
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-gray-300"
      >
        <Box className="w-20 h-20" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-gray-700">{message}</h3>
        <p className="text-sm text-gray-500">
            {item ? `the ${item} could not be found`:`Try adjusting your filters or adding new items.`}
        </p>
      </motion.div>
    </div> */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-lg p-12 text-center" // removed bg-white shadow-sm
      >
        {resourceType ? (
          <ResourceIcon
            resourceType={resourceType}
            // className="w-16 h-16 text-gray-300 mx-auto mb-4"
            className="w-24 h-24 text-gray-300 mx-auto mb-6"
          />
        ) : (
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        )}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {message ? message : `No items found`}
        </h3>
        {subtext && <p className="text-gray-600 mb-6">{subtext}</p>}
        {
          actionLabel &&
            (onAction ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={onAction}
                >
                  {actionLabel}
                </motion.button>
              </>
            ) : (
              <>
                <Link href={route}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {actionLabel}
                  </motion.button>
                </Link>
              </>
            ))
          //   <Link href={route}>
          //     <motion.button
          //       whileHover={{ scale: 1.05 }}
          //       whileTap={{ scale: 0.95 }}
          //       className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          //     >
          //       {actionLabel}
          //     </motion.button>
          //   </Link>
        }
      </motion.div>
    </>
  );
};

// // example Usage
// <EmptyState
//   message="No Product found"
//   subtext="Try adjusting or Reseting your filters."
//   actionLabel="Reset Filters"
//   route="/products" // if applicable
//   onAction={() => functionName  }
//   resourceType={"product"}
// />;

// Cart Empty State
// {
//   message: "Your cart is empty",
//   subtext: "Looks like you haven’t added anything to your cart yet.",
//   actionLabel: "Browse Products",
//   route: "/products",
//   resourceType: "cart"
// }

// {
//   message: "No products found",
//   subtext: "Try adjusting your filters or add new products to your store.",
//   actionLabel: "Add Product",
//   route: "/admin/products/add",
//   resourceType: "product",
//   icon: "PackageSearch"
// }

// {
//   message: "No orders found",
//   subtext: "Try changing your filters or check back later for new orders.",
//   actionLabel: "View Products",
//   route: "/products",
//   resourceType: "order",
//   icon: "ClipboardList"
// }

// {
//   message: "Your cart is empty",
//   subtext: "You haven’t added anything yet. Start exploring our products.",
//   actionLabel: "Browse Products",
//   route: "/products",
//   resourceType: "cart",
//   icon: "ShoppingCart"
// }
