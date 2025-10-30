import { motion } from "framer-motion";
import { ArrowLeft, Box, BoxIcon, ClipboardList, ClipboardX, PackageSearch, PackageX, ShoppingCart } from "lucide-react"; // or any suitable icon
import Button from "./Button";
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
      Comp = PackageX;
      break;
    case "order":
      //   Comp = Package;
      Comp = ClipboardX;
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

export const ResourceNotFound = ({
  message,
  subtext,
  actionLabel,
  onAction,
  route,
  resourceType, // to show icon accordingly
}) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-gray-50 text-center" // changed min-h-[60vh] to min-h-screen
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-gray-300"
      >
        {resourceType ? (
          <ResourceIcon
            resourceType={resourceType}
            className="w-24 h-24 mx-auto"
          />
        ) : (
          <Box className="w-24 h-24 mx-auto" />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h3 className="text-xl font-semibold text-gray-700">
          {message ? message : "not found"}
        </h3>
        {subtext && <p className="text-gray-600 mb-6">{subtext}</p>}

        {actionLabel &&
          (onAction ? (
            <>
              <Button
                icon={ArrowLeft}
                size="lg"
                className="mt-4"
                // className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            </>
          ) : (
            <>
              <Link href={route}>
                <Button
                  icon={ArrowLeft}
                  size="lg"
                  className="mt-4"
                  // className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {actionLabel}
                </Button>
              </Link>
            </>
          ))}

        {/* {actionLabel && (
          <Link href={route}>
            <Button
              icon={ArrowLeft}
              size="lg"
              className="mt-4"
              //   onClick={onAction}
              //   className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {actionLabel}
            </Button>
          </Link>
        )} */}
      </motion.div>
    </div>
  );
};

// // Usage Exmple
// <ResourceNotFound
//   message="This product does not exist or has been removed."
//   subtext="Try Going Back and find from Product list"
//   actionLabel="Back to Products"
//   onAction={() => navigate("/products")}
//   route={"/products"}
//   resourceType={'product'}
// />;

// {
//   message: "This product could not be loaded.",
//   subtext: "It may have been removed or is temporarily unavailable.",
//   actionLabel: "Back to Products",
//   route: "/products",
//   resourceType: "product",
//   icon: "PackageX"
// }

// {
//   message: "This order could not be loaded.",
//   subtext: "It may not exist or there was an issue fetching the details.",
//   actionLabel: "Back to Orders",
//   route: "/orders",
//   resourceType: "order",
//   icon: "ClipboardX"
// }

// {
//   message: "Your cart could not be loaded.",
//   subtext: "Something went wrong while fetching your cart. Please try again.",
//   actionLabel: "Go to Home",
//   route: "/",
//   resourceType: "cart",
//   icon: "ShoppingCartOff"
// }
