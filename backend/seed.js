/**
 * TechTies Database Seeder
 * Run with: node seed.js
 * Creates 25 realistic user accounts with diverse ages, locations, and skills.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Profile = require("./models/Profile");
const { computeAge } = require("./utils/dateUtils");

const MONGO_URI = process.env.MONGO_URI;

// ----- Seed Data -----
const SKILLS_POOL = [
  "JavaScript", "Python", "React", "Node.js", "Vue.js", "Angular",
  "TypeScript", "MongoDB", "PostgreSQL", "Docker", "Kubernetes", "AWS",
  "Figma", "UI/UX Design", "Machine Learning", "Data Analysis", "GraphQL",
  "REST APIs", "C#", "Java", "Swift", "Flutter", "DevOps", "CI/CD",
  "Agile", "Scrum", "Product Strategy", "Wireframing", "Cybersecurity",
];

const LOCATIONS = [
  "London, Ontario", "London, Ontario", "London, Ontario", // weighted local
  "Toronto, Ontario", "Toronto, Ontario",
  "Vancouver, BC", "Montreal, QC", "Ottawa, Ontario",
  "Calgary, AB", "Edmonton, AB", "Winnipeg, MB",
  "New York, USA", "San Francisco, USA", "Austin, USA",
  "London, UK", "Manchester, UK",
];

const MEMBER_TYPES = [
  "Developer", "Designer", "Product Manager",
  "Data Scientist", "DevOps Engineer", "Student",
];

const DOB_SAMPLES = [
  "2005-03-12", "2004-07-22", "2003-11-05", // ~19-21
  "2000-01-15", "1999-08-30", "1998-06-18", // ~24-26
  "1995-04-25", "1994-09-10", "1993-12-01", // ~29-31
  "1990-02-28", "1989-07-04", "1988-11-20", // ~34-36
  "1985-05-14", "1984-09-08", "1983-03-30", // ~39-41 
  "1980-01-01", "1979-06-15", "1978-10-22", // ~44-46
  "1975-08-05", "1974-02-17", "1973-11-09", // ~49-51
  "1970-04-20", "1969-07-31", "1968-12-03", // ~54-56
  "1965-09-14",                               // ~59
];

const FIRST_NAMES = [
  "Alex", "Jordan", "Morgan", "Taylor", "Riley",
  "Casey", "Jamie", "Quinn", "Cameron", "Avery",
  "Blake", "Dana", "Emery", "Finley", "Harper",
  "Hayden", "Kennedy", "Logan", "Mackenzie", "Peyton",
  "Reese", "Rowan", "Sage", "Skyler", "Sydney",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones",
  "Garcia", "Miller", "Davis", "Wilson", "Martinez",
  "Anderson", "Taylor", "Thomas", "Moore", "Jackson",
  "Martin", "Lee", "Thompson", "White", "Harris",
  "Clark", "Lewis", "Robinson", "Walker", "Young",
];

const PASSWORD = "Password123!";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}


async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Wipe existing seeded users (those with @seed.techties.com emails)
  const existingSeeded = await User.find({ email: /@seed\.techties\.com$/ });
  const seededIds = existingSeeded.map(u => u._id);
  await Profile.deleteMany({ user: { $in: seededIds } });
  await User.deleteMany({ email: /@seed\.techties\.com$/ });
  console.log(`🗑️  Cleared ${existingSeeded.length} previous seed accounts`);

  const salt = await bcrypt.genSalt(10);
  const hashedPw = await bcrypt.hash(PASSWORD, salt);

  const locationDistribution = [
    // 8 users in London Ontario (same as the test profile) for high location matches
    ...Array(8).fill("London, Ontario"),
    "Toronto, Ontario", "Toronto, Ontario",
    "Vancouver, BC", "Montreal, QC", "Ottawa, Ontario",
    "Calgary, AB", "New York, USA", "San Francisco, USA",
    "Austin, USA", "London, UK", "Manchester, UK",
    "Edmonton, AB", "Winnipeg, MB", "Miami, USA",
  ];

  for (let i = 0; i < 25; i++) {
    const firstName = FIRST_NAMES[i];
    const lastName = LAST_NAMES[i];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@seed.techties.com`;
    const dob = DOB_SAMPLES[i];
    const age = computeAge(dob);
    const location = locationDistribution[i];
    const memberType = MEMBER_TYPES[i % MEMBER_TYPES.length];
    const skills = pickN(SKILLS_POOL, Math.floor(Math.random() * 4) + 3); // 3-6 skills
    const gender = i % 3 === 0 ? "Male" : i % 3 === 1 ? "Female" : "Non-binary";

    // Create user
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPw,
      role: "member",
      isPaid: true,
    });

    // Create profile
    await Profile.create({
      user: user._id,
      salutation: gender === "Male" ? "Mr" : gender === "Female" ? "Ms" : "Other",
      firstName,
      lastName,
      nickname: `${firstName.toLowerCase()}${i + 1}`,
      dob,
      gender,
      email,
      contactMethod: pick(["Email", "Phone", "LinkedIn", "Discord"]),
      memberType,
      location,
      bio: `Hi! I'm a ${age}-year-old ${memberType} based in ${location}. I love working on tech projects and meeting like-minded people.`,
      allowContactShare: Math.random() > 0.4, // 60% allow contact sharing
      phone: `+1 519-${String(Math.floor(Math.random() * 9000000) + 1000000).slice(0, 7)}`,
      age,
      skills,
      matchingPreferences: {
        ageRange: { min: Math.max(18, age - 15), max: Math.min(70, age + 15) },
        locationPreference: i < 8 ? "Local" : "Global",
        preferredMemberTypes: pickN(MEMBER_TYPES, 3),
      },
    });

    console.log(`  ✔ Created: ${firstName} ${lastName} | Age: ${age} | ${memberType} | ${location}`);
  }

  console.log("\n✅ Seeding complete! 25 accounts created.");
  console.log(`   All accounts use password: ${PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
