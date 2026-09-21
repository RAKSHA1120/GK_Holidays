const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load .env variables
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(envPath);
    } catch (e) {
      console.warn("Notice: failed to loadEnvFile, parsing manually:", e.message);
    }
  }
  // Fallback simple parser for .env if needed
  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function runMigration() {
  console.log("=== GK Holidays: Starting Supabase Data Migration ===");

  // 1. Migrate Packages
  const packagesPath = path.join(__dirname, "..", "packages-db.json");
  const packagesData = JSON.parse(fs.readFileSync(packagesPath, "utf8"));
  console.log(`Found ${packagesData.length} packages in packages-db.json`);

  for (const pkg of packagesData) {
    const { error } = await supabase.from("packages").upsert({
      id: pkg.id,
      title: pkg.title,
      destination: pkg.destination,
      region: pkg.region,
      type: pkg.type,
      days: pkg.days,
      price: pkg.price,
      image: pkg.image,
      summary: pkg.summary,
      highlights: pkg.highlights,
      itinerary: pkg.itinerary,
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      updated_at: new Date().toISOString()
    }, { onConflict: "id" });

    if (error) {
      console.error(`Error migrating package ${pkg.id}:`, error.message);
      process.exit(1);
    }
  }
  console.log(`Successfully migrated ${packagesData.length} packages.`);

  // 2. Migrate Settings
  const settingsPath = path.join(__dirname, "..", "settings-db.json");
  const settingsData = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  console.log("Migrating settings from settings-db.json...");

  const { error: settingsError } = await supabase.from("settings").upsert({
    id: 1,
    address: settingsData.address,
    whatsapp: settingsData.whatsapp,
    email: settingsData.email,
    phoneNumbers: settingsData.phoneNumbers,
    instagramHandle: settingsData.instagramHandle || "",
    instagramUrl: settingsData.instagramUrl || "",
    updated_at: new Date().toISOString()
  }, { onConflict: "id" });

  if (settingsError) {
    console.error("Error migrating settings:", settingsError.message);
    process.exit(1);
  }
  console.log("Successfully migrated settings.");

  // 3. Migrate Feedback
  const feedbackPath = path.join(__dirname, "..", "feedback-db.json");
  const feedbackData = JSON.parse(fs.readFileSync(feedbackPath, "utf8"));
  console.log(`Found ${feedbackData.length} feedback records in feedback-db.json`);

  for (const fb of feedbackData) {
    const { error } = await supabase.from("feedback").upsert({
      id: fb.id,
      collegeName: fb.collegeName,
      studentName: fb.studentName,
      foodRating: fb.foodRating,
      travelRating: fb.travelRating,
      placesRating: fb.placesRating,
      comments: fb.comments || "",
      submittedDate: fb.submittedDate
    }, { onConflict: "id" });

    if (error) {
      console.error(`Error migrating feedback ${fb.id}:`, error.message);
      process.exit(1);
    }
  }
  console.log(`Successfully migrated ${feedbackData.length} feedback records.`);

  // 4. Verify Record Counts
  console.log("\n=== Verifying Record Counts in Supabase ===");
  const { count: pkgCount, error: pkgCountErr } = await supabase.from("packages").select("*", { count: "exact", head: true });
  const { count: setCount, error: setCountErr } = await supabase.from("settings").select("*", { count: "exact", head: true });
  const { count: fbCount, error: fbCountErr } = await supabase.from("feedback").select("*", { count: "exact", head: true });

  if (pkgCountErr || setCountErr || fbCountErr) {
    console.error("Verification query error:", pkgCountErr || setCountErr || fbCountErr);
    process.exit(1);
  }

  console.log(`Supabase 'packages' count: ${pkgCount} (Expected: ${packagesData.length})`);
  console.log(`Supabase 'settings' count: ${ setCount} (Expected: 1)`);
  console.log(`Supabase 'feedback' count: ${fbCount} (Expected: ${feedbackData.length})`);

  if (pkgCount === packagesData.length && setCount === 1 && fbCount === feedbackData.length) {
    console.log("\n>>> SUCCESS: All data migrated and verified with 100% integrity! <<<");
  } else {
    console.error("\n>>> WARNING: Record count mismatch! <<<");
    process.exit(1);
  }
}

runMigration().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
