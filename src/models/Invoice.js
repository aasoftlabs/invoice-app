import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  dueDate: Date,
  client: {
    name: String,
    company: String,
    address: String,
    gst: String,
  },
  items: [
    {
      description: String,
      rate: Number,
      qty: Number,
    },
  ],
  totalAmount: Number,
  status: { type: String, default: "Pending" }, // Pending, Paid
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
