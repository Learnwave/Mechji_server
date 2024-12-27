import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    address: { type: Object, default: {} },
    products: { type: Array, default: [] },
    date: { type: Number, required: true },
    available: { type: Boolean, default: true },
    about: { type: String, required: true }
  },
  { minimize: false }
);

const shopModel = mongoose.model.shop || mongoose.model("shop", shopSchema);

export default shopModel;
