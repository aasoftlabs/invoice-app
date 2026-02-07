const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local correctly
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const index = line.indexOf("=");
      if (index !== -1) {
        const key = line.substring(0, index).trim();
        let value = line.substring(index + 1).trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Error loading .env.local", e);
}

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  permissions: [String],
});

// Use existing model if available to avoid overwrite error
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function checkUsers() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env.local");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const users = await User.find({}, "name email role permissions");
    console.log("Users found:", users.length);
    users.forEach((u) => {
      console.log(
        `Name: ${u.name}, Email: ${u.email}, Role: '${u.role}', Permissions: ${JSON.stringify(u.permissions)}`,
      );
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkUsers();
