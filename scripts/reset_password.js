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
  const value = parts.join("=");
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

async function resetPassword() {
  const uri = envConfig.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const email = "admin@aasoftlabs.com";
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.updateOne(
      { email },
      { $set: { password: hashedPassword } },
    );

    if (result.matchedCount === 0) {
      console.log(`User ${email} NOT FOUND.`);
    } else {
      console.log(`Password for ${email} has been reset to '${password}'.`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
