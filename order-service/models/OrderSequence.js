const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelize");

const OrderSequence = sequelize.define("OrderSequence", {
  orderDate: {
    type: DataTypes.DATEONLY,
    primaryKey: true,
  },
  lastSequence: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: "order_sequences",
  timestamps: false,
});


module.exports = OrderSequence;
