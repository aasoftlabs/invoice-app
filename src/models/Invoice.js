import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  dueDate: { type: Date },
  type: {
    type: String,
    enum: ["Standard", "Digital"],
    default: "Digital",
  },
  showQrCode: { type: Boolean, default: false },

  client: {
    name: String,
    company: String,
    address: String,
    gst: String,
  },
  items: [
    {
      description: String,
      subDescription: String, // Optional detailed description
      rate: Number,
      qty: Number,
      amount: Number,
    },
  ],
  taxRate: { type: Number, default: 0 },
  totalAmount: Number,
  amountPaid: { type: Number, default: 0 }, // Track total amount received
  paymentHistory: [
    {
      amount: Number,
      date: Date,
      note: String,
      transactionId: mongoose.Schema.Types.ObjectId
    }
  ],
  status: { type: String, default: "Pending" }, // Pending, Paid, Partial, Overdue, Cancelled
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
