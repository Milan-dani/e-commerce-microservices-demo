const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelize");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSONB, // [{productId, quantity, price}]
    allowNull: false,
  },
  shippingFee: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending", // pending, paid, shipped, delivered, cancelled
  },
});

module.exports = Order;
