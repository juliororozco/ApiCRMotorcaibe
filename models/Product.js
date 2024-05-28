const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true
  },
  name: {
    type: String,
    required: [true, 'no puede estar en blanco']
  },
  description: {
    type: String,
    required: [true, 'no puede estar en blanco']
  },
  price: {
    type: String,
    required: [true, 'no puede estar en blanco']
  },
  category: {
    type: String,
    required: [true, 'no puede estar en blanco']
  },
  pictures: {
    type: Array,
    required: true
  }
}, { minimize: false });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
