const http = require("http");
const { createClient } = require("@supabase/supabase-js");

process.loadEnvFile();

const BASE_URL = "http://localhost:3000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { ...headers }
    };

    let bodyData = null;
    if (body) {
      bodyData = JSON.stringify(body);
      options.headers["Content-Type"] = "application/json";
      options.headers["Content-Length"] = Buffer.byteLength(bodyData);
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on("error", reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("   GK Holidays: Migration End-to-End Test Suite  ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = "") {
    if (condition) {
      console.log(`[PASS] ${name} ${extra}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Public Website & Static Assets
  // ----------------------------------------------------
  console.log("--- TEST 1: Public Website & Static Assets ---");
  const homeRes = await makeRequest("GET", "/");
  assert("Home page loads (200 OK)", homeRes.status === 200 && typeof homeRes.body === "string" && homeRes.body.includes("GK Holidays"));

  const adminPageRes = await makeRequest("GET", "/admin.html");
  assert("Admin portal page loads (200 OK)", adminPageRes.status === 200 && typeof adminPageRes.body === "string" && adminPageRes.body.includes("Admin Portal"));

  const publicPkgs = await makeRequest("GET", "/api/packages");
  assert("GET /api/packages returns 200 array", publicPkgs.status === 200 && Array.isArray(publicPkgs.body) && publicPkgs.body.length >= 12, `(got ${publicPkgs.body.length} packages)`);

  const publicSettings = await makeRequest("GET", "/api/settings");
  assert("GET /api/settings returns 200 object", publicSettings.status === 200 && publicSettings.body.whatsapp === "918072812071");

  const publicFb = await makeRequest("GET", "/api/feedback/public");
  assert("GET /api/feedback/public returns 200 array", publicFb.status === 200 && Array.isArray(publicFb.body) && publicFb.body.length >= 4);

  // ----------------------------------------------------
  // TEST 2: Admin Login
  // ----------------------------------------------------
  console.log("\n--- TEST 2: Admin Login ---");
  const badLogin = await makeRequest("POST", "/api/admin/login", { password: "wrong-password" });
  assert("Invalid login rejected (401)", badLogin.status === 401);

  const goodLogin = await makeRequest("POST", "/api/admin/login", { password: ADMIN_PASSWORD });
  assert("Valid admin login succeeds (200)", goodLogin.status === 200 && goodLogin.body.token === ADMIN_TOKEN);
  const token = goodLogin.body.token;

  // ----------------------------------------------------
  // TEST 3: Add Package (Admin)
  // ----------------------------------------------------
  console.log("\n--- TEST 3: Add Package ---");
  const testPkgId = `test-tour-${Date.now()}`;
  const newPkgPayload = {
    id: testPkgId,
    title: "Test Ooty Adventure",
    destination: "Ooty",
    region: "oneday",
    type: "Hill Station Special",
    days: "1 Day",
    price: 3500,
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff",
    summary: "Automated test package for Supabase migration.",
    highlights: ["Tea gardens", "Doddabetta Peak"],
    itinerary: ["08:00 AM - Arrival in Ooty", "05:00 PM - Departure"],
    inclusions: ["Transportation", "Lunch"],
    exclusions: ["Personal expenses"]
  };

  const addRes = await makeRequest("POST", "/api/packages", newPkgPayload, {
    "Authorization": `Bearer ${token}`
  });
  assert("POST /api/packages returns 201 Created", addRes.status === 201 && addRes.body.success === true);

  // Verify in Supabase
  const { data: addedInSupabase } = await supabase.from("packages").select("*").eq("id", testPkgId).maybeSingle();
  assert("Package verified in Supabase database", addedInSupabase && addedInSupabase.id === testPkgId && addedInSupabase.title === "Test Ooty Adventure");

  // ----------------------------------------------------
  // TEST 4: Edit Package (Admin)
  // ----------------------------------------------------
  console.log("\n--- TEST 4: Edit Package ---");
  const editedPayload = {
    ...newPkgPayload,
    title: "Test Ooty Adventure (Updated)",
    price: 3800
  };

  const editRes = await makeRequest("POST", "/api/packages/edit", editedPayload, {
    "Authorization": `Bearer ${token}`
  });
  assert("POST /api/packages/edit returns 200 OK", editRes.status === 200 && editRes.body.success === true);

  // Verify in Supabase
  const { data: updatedInSupabase } = await supabase.from("packages").select("*").eq("id", testPkgId).maybeSingle();
  assert("Package update verified in Supabase", updatedInSupabase && updatedInSupabase.title === "Test Ooty Adventure (Updated)" && updatedInSupabase.price === 3800);

  // ----------------------------------------------------
  // TEST 5: Delete Package (Admin)
  // ----------------------------------------------------
  console.log("\n--- TEST 5: Delete Package ---");
  const deleteRes = await makeRequest("POST", "/api/packages/delete", { id: testPkgId }, {
    "Authorization": `Bearer ${token}`
  });
  assert("POST /api/packages/delete returns 200 OK", deleteRes.status === 200 && deleteRes.body.success === true);

  // Verify deletion in Supabase
  const { data: deletedInSupabase } = await supabase.from("packages").select("*").eq("id", testPkgId).maybeSingle();
  assert("Deleted package absent from Supabase", deletedInSupabase === null);

  // ----------------------------------------------------
  // TEST 6: Settings Update (Admin)
  // ----------------------------------------------------
  console.log("\n--- TEST 6: Settings Update ---");
  const currentSettingsRes = await makeRequest("GET", "/api/settings");
  const originalSettings = currentSettingsRes.body;

  const testSettingsPayload = {
    ...originalSettings,
    instagramHandle: "@gk_holidays_verified_test"
  };

  const updateSettingsRes = await makeRequest("POST", "/api/settings", testSettingsPayload, {
    "Authorization": `Bearer ${token}`
  });
  assert("POST /api/settings returns 200 OK", updateSettingsRes.status === 200 && updateSettingsRes.body.success === true);

  // Verify in Supabase
  const { data: settingsInSupabase } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  assert("Settings update verified in Supabase", settingsInSupabase && settingsInSupabase.instagramHandle === "@gk_holidays_verified_test");

  // Restore original settings
  await makeRequest("POST", "/api/settings", originalSettings, {
    "Authorization": `Bearer ${token}`
  });
  console.log("Original settings restored.");

  // ----------------------------------------------------
  // TEST 7: Feedback Submission (Public)
  // ----------------------------------------------------
  console.log("\n--- TEST 7: Feedback Submission ---");
  const testFbPayload = {
    collegeName: "Test Migration College",
    studentName: "Test Student",
    foodRating: 5,
    travelRating: 5,
    placesRating: 5,
    comments: "Automated test review - everything is perfect!"
  };

  const submitFbRes = await makeRequest("POST", "/api/feedback", testFbPayload);
  assert("POST /api/feedback returns 201 Created", submitFbRes.status === 201 && submitFbRes.body.success === true);
  const createdFbId = submitFbRes.body.feedback.id;

  // Verify in Supabase
  const { data: fbInSupabase } = await supabase.from("feedback").select("*").eq("id", createdFbId).maybeSingle();
  assert("Feedback record verified in Supabase", fbInSupabase && fbInSupabase.collegeName === "Test Migration College");

  // ----------------------------------------------------
  // TEST 8: Admin Feedback Viewing
  // ----------------------------------------------------
  console.log("\n--- TEST 8: Admin Feedback Viewing ---");
  const adminFbUnauth = await makeRequest("GET", "/api/feedback");
  assert("Unauthenticated GET /api/feedback rejected (401)", adminFbUnauth.status === 401);

  const adminFbAuth = await makeRequest("GET", "/api/feedback", null, {
    "Authorization": `Bearer ${token}`
  });
  assert("Authenticated GET /api/feedback returns 200 array", adminFbAuth.status === 200 && Array.isArray(adminFbAuth.body) && adminFbAuth.body.some(f => f.id === createdFbId));

  // Clean up test feedback from Supabase
  await supabase.from("feedback").delete().eq("id", createdFbId);
  console.log("Test feedback record cleaned up.");

  console.log("\n==================================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
