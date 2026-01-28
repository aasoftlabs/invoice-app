import mongoose from "mongoose";

const CompanyProfileSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Company Name
  billingName: { type: String }, // Optional: Name to use in "Bill From" if different
  slogan: { type: String }, // Baseline/Slogan below name
  tagline: { type: String }, // Extra tagline (e.g. Next-Gen Web...)
  logo: { type: String }, // Base64 string or URL
  address: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  registrationNo: { type: String }, // Reg No
  registrationType: { type: String }, // where from registration
  pan: { type: String }, // PAN Details
  gstIn: { type: String }, // GSTIN
  bankDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    branch: String,
  },
  formatting: {
    color: { type: String, default: "#1d4ed8" }, // Default blue-700
    font: { type: String, default: "sans" },
  },
  updatedAt: { type: Date, default: Date.now },
});

// We expect only one profile, so we can just grab the first one mostly.
export default mongoose.models.CompanyProfile ||
  mongoose.model("CompanyProfile", CompanyProfileSchema);
