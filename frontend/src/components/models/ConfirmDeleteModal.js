import { AnimatePresence, motion } from "framer-motion";
import { X, Trash } from "lucide-react";
import Button from "../Button";
import { useDeleteProductMutation } from "@/api/services/productsApi";
import toast from "react-hot-toast";

const ConfirmDeleteModal = ({ open, onClose,  deletingProduct }) => {
   const [deleteProduct] = useDeleteProductMutation();

  async function handleDeleteConfirm() {
    try {
      const res = await deleteProduct(deletingProduct._id).unwrap();
      toast.success(res.message || "Product deleted successfully!");
      
      // Optional: refresh the product list
    //   if (refreshProducts) refreshProducts();
    onClose();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error(err?.data?.message || "Failed to delete product");
    }
  }
  
    return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md mt-20"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Confirm Delete</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-center">
              <Trash className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <span className="font-semibold">{deletingProduct.name}</span>? This action cannot be undone.
              </p>

              <div className="flex justify-center gap-4">
                <Button
                  variant="secondary-outline"
                  size="md"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger-outline"
                  size="md"
                  onClick={() => {
                    handleDeleteConfirm();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
