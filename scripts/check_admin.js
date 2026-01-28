const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const envConfig = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  const key = parts.shift();
  const value = parts.join("="); // Join back the rest
  if (key && value) {
    envConfig[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
  }
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function checkAdmin() {
  const uri = envConfig.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const email = "admin@aasoftlabs.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User ${email} NOT FOUND.`);
    } else {
      console.log(`User ${email} FOUND.`);
      console.log(`Role: ${user.role}`);

      const isMatch = await bcrypt.compare("admin123", user.password);
      console.log(`Password 'admin123' match: ${isMatch}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdmin();
