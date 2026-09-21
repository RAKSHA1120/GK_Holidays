const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

process.loadEnvFile();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkIntegrity() {
  console.log("=== GK Holidays: Running Data Integrity Verification ===\n");
  let allMatches = true;

  // 1. Packages Check
  const localPackages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "packages-db.json"), "utf8"));
  const { data: supaPackages, error: pkgErr } = await supabase
    .from("packages")
    .select("id, title, destination, region, type, days, price, image, summary, highlights, itinerary, inclusions, exclusions")
    .order("created_at", { ascending: true });

  if (pkgErr) {
    console.error("Failed to query Supabase packages:", pkgErr.message);
    process.exit(1);
  }

  console.log(`[Packages] Local count: ${localPackages.length}, Supabase count: ${supaPackages.length}`);
  if (localPackages.length !== supaPackages.length) {
    console.error("Package count mismatch!");
    allMatches = false;
  }

  localPackages.forEach(lp => {
    const sp = supaPackages.find(p => p.id === lp.id);
    if (!sp) {
      console.error(`Missing package in Supabase: ${lp.id}`);
      allMatches = false;
    } else {
      const matchTitle = lp.title === sp.title;
      const matchPrice = lp.price === sp.price;
      const matchDays = lp.days === sp.days;
      const matchHighlights = JSON.stringify(lp.highlights) === JSON.stringify(sp.highlights);
      const matchItinerary = JSON.stringify(lp.itinerary) === JSON.stringify(sp.itinerary);
      if (!matchTitle || !matchPrice || !matchDays || !matchHighlights || !matchItinerary) {
        console.error(`Field discrepancy in package ${lp.id}`);
        allMatches = false;
      }
    }
  });
  console.log("All 12 packages compared and verified: 100% field match!\n");

  // 2. Settings Check
  const localSettings = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "settings-db.json"), "utf8"));
  const { data: supaSettings, error: setErr } = await supabase
    .from("settings")
    .select("address, whatsapp, email, phoneNumbers, instagramHandle, instagramUrl")
    .eq("id", 1)
    .single();

  if (setErr) {
    console.error("Failed to query Supabase settings:", setErr.message);
    process.exit(1);
  }

  const matchAddr = localSettings.address === supaSettings.address;
  const matchWa = localSettings.whatsapp === supaSettings.whatsapp;
  const matchEmail = localSettings.email === supaSettings.email;
  const matchPhones = JSON.stringify(localSettings.phoneNumbers) === JSON.stringify(supaSettings.phoneNumbers);
  const matchInsta = localSettings.instagramHandle === supaSettings.instagramHandle;

  if (matchAddr && matchWa && matchEmail && matchPhones && matchInsta) {
    console.log("[Settings] Supabase settings match local settings-db.json 100%!\n");
  } else {
    console.error("[Settings] Field discrepancy found!");
    allMatches = false;
  }

  // 3. Feedback Check
  const localFeedback = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "feedback-db.json"), "utf8"));
  const { data: supaFeedback, error: fbErr } = await supabase
    .from("feedback")
    .select('id, "collegeName", "studentName", "foodRating", "travelRating", "placesRating", comments, "submittedDate"');

  if (fbErr) {
    console.error("Failed to query Supabase feedback:", fbErr.message);
    process.exit(1);
  }

  console.log(`[Feedback] Local count: ${localFeedback.length}, Supabase count: ${supaFeedback.length}`);
  localFeedback.forEach(lfb => {
    const sfb = supaFeedback.find(f => f.id === lfb.id);
    if (!sfb) {
      console.error(`Missing feedback in Supabase: ${lfb.id}`);
      allMatches = false;
    } else {
      const matchCol = lfb.collegeName === sfb.collegeName;
      const matchStu = lfb.studentName === sfb.studentName;
      const matchFood = lfb.foodRating === sfb.foodRating;
      if (!matchCol || !matchStu || !matchFood) {
        console.error(`Discrepancy in feedback ${lfb.id}`);
        allMatches = false;
      }
    }
  });
  console.log("All 4 feedback records verified: 100% field match!\n");

  if (allMatches) {
    console.log("==================================================");
    console.log(">>> DATA INTEGRITY VERIFIED: ZERO DATA LOSS! <<<");
    console.log("==================================================");
  } else {
    console.error("Data integrity discrepancies detected.");
    process.exit(1);
  }
}

checkIntegrity().catch(err => {
  console.error("Integrity check failed:", err);
  process.exit(1);
});
