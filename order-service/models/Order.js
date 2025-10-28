const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelize");

// const Order = sequelize.define("Order", {
//   orderNumber: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true,
//   },
//   userId: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   items: {
//     type: DataTypes.JSONB, // [{productId, quantity, price}]
//     allowNull: false,
//   },
//   shippingFee: {
//     type: DataTypes.FLOAT,
//     defaultValue: 0,
//   },
//   total: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   status: {
//     type: DataTypes.STRING,
//     defaultValue: "pending", // pending, paid, shipped, delivered, cancelled
//   },
// });
const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { type: DataTypes.STRING, allowNull: false },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  items: { type: DataTypes.JSON, allowNull: false }, // snapshot of products
  shippingInfo: { type: DataTypes.JSON },
  paymentInfo: {
    type: DataTypes.JSON,
    defaultValue: { status: "pending", method: null, transactionId: null },
  },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  shippingFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM(
      "pending",
      "paid",
      "failed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "fulfilled"
    ),
    defaultValue: "pending",
  },
  currentStep: { type: DataTypes.INTEGER, defaultValue: 1 },
}, {
  timestamps: true,
});
module.exports = Order;
