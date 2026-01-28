const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Schema locally to ensure we read what's actually there (but strict: false to see everything)
const CompanyProfileSchema = new mongoose.Schema({
    name: String,
    slogan: String,
    tagline: String, // We want to check this
}, { strict: false });

const CompanyProfile = mongoose.models.CompanyProfile || mongoose.model("CompanyProfile", CompanyProfileSchema);

async function check() {
    if (!process.env.MONGODB_URI) {
        console.error("No MONGODB_URI found");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const profile = await CompanyProfile.findOne({});
    console.log("Profile Tagline:", profile ? profile.tagline : "No Profile");
    console.log("Profile Full:", profile);
    await mongoose.disconnect();
}

check();
