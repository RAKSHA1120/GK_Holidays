const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

// Load .env variables safely for local development (Node 20.12+ / 24+)
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn("Notice: Failed to load .env file:", err.message);
    }
  }
}

// Initialize Supabase Client lazily
let supabase = null;
function getSupabase() {
  if (supabase) return supabase;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return supabase;
}

function safeCompare(input, secret) {
  if (typeof input !== "string" || typeof secret !== "string") {
    return false;
  }
  if (input.length === 0 || secret.length === 0) {
    return false;
  }
  const inputHash = crypto.createHash("sha256").update(input).digest();
  const secretHash = crypto.createHash("sha256").update(secret).digest();
  return crypto.timingSafeEqual(inputHash, secretHash);
}

function readRequestBody(req) {
  if (req.body) {
    if (typeof req.body === "object") {
      return Promise.resolve(req.body);
    }
    if (typeof req.body === "string") {
      try {
        return Promise.resolve(JSON.parse(req.body));
      } catch (e) {
        return Promise.resolve({});
      }
    }
  }
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data, customHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    ...customHeaders
  });
  res.end(JSON.stringify(data));
}

function isAuthorized(req) {
  const configuredToken = process.env.ADMIN_TOKEN;
  if (!configuredToken || typeof configuredToken !== "string" || configuredToken.trim() === "") {
    return false;
  }
  const authHeader = req.headers["authorization"] || "";
  if (!authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice(7).trim();
  return safeCompare(token, configuredToken.trim());
}

module.exports = async function handler(req, res) {
  supabase = getSupabase();

  // Determine the original request pathname
  let pathname = "";

  if (req.query && req.query.path) {
    // Vercel catch-all route api/[...path].js populates req.query.path as an array or string
    const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    pathname = "/api/" + segments.join("/");
  } else {
    // Fallback: parse pathname directly from req.url
    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    pathname = parsedUrl.pathname;

    // If the path reflects internal function filename, inspect invocation headers
    if (pathname.includes("[...path]") || pathname === "/api" || pathname === "/api/") {
      const matched = req.headers["x-matched-path"] || req.headers["x-invoke-path"];
      if (matched && matched.startsWith("/api")) {
        pathname = matched;
      }
    }
  }

  // Normalize: remove trailing slash and ensure /api prefix
  pathname = pathname.replace(/\/+$/, "") || "/";
  if (!pathname.startsWith("/api")) {
    pathname = "/api" + (pathname.startsWith("/") ? pathname : "/" + pathname);
  }

  // --- API Routing ---

  // 1. GET /api/settings
  if (req.method === "GET" && pathname === "/api/settings") {
    const defaultSettings = {
      address: "C4, First Floor, Alayamani Enclave, Paari Nagar, Palayapalayam Pirivu, Erode - 638 011. Tamilnadu. India.",
      whatsapp: "918072812071",
      phoneNumbers: ["+91 8072 812 071", "+91 98428 79490", "+91 63800 21474"],
      email: "gkholidays@gmail.com",
      instagramHandle: "@gk_holidays_official",
      instagramUrl: "https://www.instagram.com/gk_holidays_official"
    };

    if (!supabase) {
      return sendJson(res, 200, defaultSettings);
    }

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("address, whatsapp, email, phoneNumbers, instagramHandle, instagramUrl")
        .eq("id", 1)
        .maybeSingle();

      if (error || !data) {
        return sendJson(res, 200, defaultSettings);
      }
      return sendJson(res, 200, data);
    } catch (e) {
      return sendJson(res, 200, defaultSettings);
    }
  }

  // 2. POST /api/settings
  if (req.method === "POST" && pathname === "/api/settings") {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { error: "Unauthorized" });
    }
    const newSettings = await readRequestBody(req);
    if (!supabase) {
      return sendJson(res, 500, { error: "Database not configured" });
    }
    const payload = {
      id: 1,
      address: typeof newSettings.address === "string" ? newSettings.address.trim() : "",
      whatsapp: typeof newSettings.whatsapp === "string" ? newSettings.whatsapp.trim() : "",
      email: typeof newSettings.email === "string" ? newSettings.email.trim() : "",
      phoneNumbers: Array.isArray(newSettings.phoneNumbers) ? newSettings.phoneNumbers : [],
      instagramHandle: typeof newSettings.instagramHandle === "string" ? newSettings.instagramHandle.trim() : "",
      instagramUrl: typeof newSettings.instagramUrl === "string" ? newSettings.instagramUrl.trim() : "",
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from("settings")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        return sendJson(res, 500, { error: "Failed to save settings" });
      }
      return sendJson(res, 200, { success: true, settings: newSettings });
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to save settings" });
    }
  }

  // 3. GET /api/packages
  if (req.method === "GET" && pathname === "/api/packages") {
    if (!supabase) {
      return sendJson(res, 500, { error: "Database not configured" });
    }
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("id, title, destination, region, type, days, price, image, summary, highlights, itinerary, inclusions, exclusions")
        .order("created_at", { ascending: true });

      if (error) {
        return sendJson(res, 500, { error: "Failed to read packages" });
      }
      return sendJson(res, 200, data || []);
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to read packages" });
    }
  }

  // 4. GET /api/feedback/public
  if (req.method === "GET" && pathname === "/api/feedback/public") {
    if (!supabase) {
      return sendJson(res, 200, []);
    }
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select('id, "collegeName", "studentName", "foodRating", "travelRating", "placesRating", comments, "submittedDate"')
        .order("submittedDate", { ascending: false });

      if (error) {
        return sendJson(res, 200, []);
      }
      return sendJson(res, 200, data || []);
    } catch (e) {
      return sendJson(res, 200, []);
    }
  }

  // 5. GET /api/feedback
  if (req.method === "GET" && pathname === "/api/feedback") {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { error: "Unauthorized" });
    }
    if (!supabase) {
      return sendJson(res, 200, []);
    }
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select('id, "collegeName", "studentName", "foodRating", "travelRating", "placesRating", comments, "submittedDate"')
        .order("submittedDate", { ascending: false });

      if (error) {
        return sendJson(res, 200, []);
      }
      return sendJson(res, 200, data || []);
    } catch (e) {
      return sendJson(res, 200, []);
    }
  }

  // 6. POST /api/feedback
  if (req.method === "POST" && pathname === "/api/feedback") {
    const body = await readRequestBody(req);
    const { collegeName, studentName, foodRating, travelRating, placesRating, comments } = body;

    if (!collegeName || typeof collegeName !== "string" || collegeName.trim() === "") {
      return sendJson(res, 400, { error: "College name is required" });
    }
    if (!studentName || typeof studentName !== "string" || studentName.trim() === "") {
      return sendJson(res, 400, { error: "Student name is required" });
    }

    const parseRating = (r) => {
      const num = Number(r);
      return (!isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 5) ? num : null;
    };

    const food = parseRating(foodRating);
    const travel = parseRating(travelRating);
    const places = parseRating(placesRating);

    if (food === null || travel === null || places === null) {
      return sendJson(res, 400, { error: "Ratings for Food, Travel, and Places must be integers between 1 and 5" });
    }

    if (!supabase) {
      return sendJson(res, 500, { error: "Database not configured" });
    }

    const newFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      collegeName: collegeName.trim(),
      studentName: studentName.trim(),
      foodRating: food,
      travelRating: travel,
      placesRating: places,
      comments: typeof comments === "string" ? comments.trim() : "",
      submittedDate: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from("feedback")
        .insert([newFeedback]);

      if (error) {
        return sendJson(res, 500, { error: "Failed to save feedback" });
      }
      return sendJson(res, 201, { success: true, feedback: newFeedback });
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to save feedback" });
    }
  }

  // 7. POST /api/admin/login
  if (req.method === "POST" && pathname === "/api/admin/login") {
    const body = await readRequestBody(req);
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminToken = process.env.ADMIN_TOKEN;

    if (
      !adminPassword ||
      typeof adminPassword !== "string" ||
      adminPassword.trim() === "" ||
      !adminToken ||
      typeof adminToken !== "string" ||
      adminToken.trim() === ""
    ) {
      return sendJson(res, 500, { error: "Server authentication configuration error" });
    }

    const submittedPassword = (body && typeof body.password === "string") ? body.password : "";

    if (safeCompare(submittedPassword, adminPassword.trim())) {
      return sendJson(res, 200, { token: adminToken.trim() });
    } else {
      return sendJson(res, 401, { error: "Invalid password" });
    }
  }

  // 8. POST /api/packages
  if (req.method === "POST" && pathname === "/api/packages") {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { error: "Unauthorized" });
    }
    const newPackage = await readRequestBody(req);
    if (!supabase) {
      return sendJson(res, 500, { error: "Database not configured" });
    }
    if (!newPackage.id) {
      newPackage.id = (newPackage.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    const record = {
      id: newPackage.id,
      title: newPackage.title || "",
      destination: newPackage.destination || "",
      region: newPackage.region || "",
      type: newPackage.type || "",
      days: newPackage.days || "",
      price: Number(newPackage.price) || 0,
      image: newPackage.image || "",
      summary: newPackage.summary || "",
      highlights: Array.isArray(newPackage.highlights) ? newPackage.highlights : [],
      itinerary: Array.isArray(newPackage.itinerary) ? newPackage.itinerary : [],
      inclusions: Array.isArray(newPackage.inclusions) ? newPackage.inclusions : [],
      exclusions: Array.isArray(newPackage.exclusions) ? newPackage.exclusions : [],
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from("packages")
        .insert([record]);

      if (error) {
        return sendJson(res, 500, { error: "Failed to save package" });
      }
      return sendJson(res, 201, { success: true, package: newPackage });
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to save package" });
    }
  }

  // 9. POST /api/packages/edit
  if (req.method === "POST" && pathname === "/api/packages/edit") {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { error: "Unauthorized" });
    }
    const updatedPackage = await readRequestBody(req);
    if (!supabase) {
      return sendJson(res, 500, { error: "Database not configured" });
    }
    const packageId = updatedPackage.id;
    if (!packageId) {
      return sendJson(res, 400, { error: "Package ID is required" });
    }

    const record = {
      title: updatedPackage.title || "",
      destination: updatedPackage.destination || "",
      region: updatedPackage.region || "",
      type: updatedPackage.type || "",
      days: updatedPackage.days || "",
      price: Number(updatedPackage.price) || 0,
      image: updatedPackage.image || "",
      summary: updatedPackage.summary || "",
      highlights: Array.isArray(updatedPackage.highlights) ? updatedPackage.highlights : [],
      itinerary: Array.isArray(updatedPackage.itinerary) ? updatedPackage.itinerary : [],
      inclusions: Array.isArray(updatedPackage.inclusions) ? updatedPackage.inclusions : [],
      exclusions: Array.isArray(updatedPackage.exclusions) ? updatedPackage.exclusions : [],
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from("packages")
        .update(record)
        .eq("id", packageId)
        .select();

      if (error) {
        return sendJson(res, 500, { error: "Failed to update package" });
      }
      if (!data || data.length === 0) {
        return sendJson(res, 404, { error: "Package not found" });
      }
      return sendJson(res, 200, { success: true, package: updatedPackage });
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to update package" });
    }
  }

  // 10. POST /api/packages/delete
  if (req.method === "POST" && pathname === "/api/packages/delete") {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { error: "Unauthorized" });
    }
    const body = await readRequestBody(req);
    const packageId = body && body.id;
    if (!packageId) {
      return sendJson(res, 400, { error: "Package ID is required" });
    }
    if (!supabase) {
      return sendJson(res, 500, { error: "Database not configured" });
    }

    try {
      const { data, error } = await supabase
        .from("packages")
        .delete()
        .eq("id", packageId)
        .select();

      if (error) {
        return sendJson(res, 500, { error: "Failed to delete package" });
      }
      if (!data || data.length === 0) {
        return sendJson(res, 404, { error: "Package not found" });
      }
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to delete package" });
    }
  }

  // Fallback 404 for unmatched API routes
  sendJson(res, 404, { error: "API route not found" });
};
