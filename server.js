const http = require("http");
const fs = require("fs");
const path = require("path");
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

const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
} else {
  console.warn("Notice: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Supabase queries will fail.");
}

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

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
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => {
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

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  console.log(`${req.method} ${pathname}`);

  // --- API Routing ---
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
      sendJson(res, 200, defaultSettings);
      return;
    }

    supabase
      .from("settings")
      .select("address, whatsapp, email, phoneNumbers, instagramHandle, instagramUrl")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          sendJson(res, 200, defaultSettings);
          return;
        }
        sendJson(res, 200, data);
      })
      .catch(() => {
        sendJson(res, 200, defaultSettings);
      });
    return;
  }

  if (req.method === "POST" && pathname === "/api/settings") {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    readRequestBody(req).then(newSettings => {
      if (!supabase) {
        sendJson(res, 500, { error: "Database not configured" });
        return;
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

      supabase
        .from("settings")
        .upsert(payload, { onConflict: "id" })
        .then(({ error }) => {
          if (error) {
            console.error("Supabase settings error:", error.message);
            sendJson(res, 500, { error: "Failed to save settings" });
            return;
          }
          sendJson(res, 200, { success: true, settings: newSettings });
        })
        .catch(err => {
          console.error("Supabase settings exception:", err);
          sendJson(res, 500, { error: "Failed to save settings" });
        });
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/packages") {
    if (!supabase) {
      sendJson(res, 500, { error: "Database not configured" });
      return;
    }
    supabase
      .from("packages")
      .select("id, title, destination, region, type, days, price, image, summary, highlights, itinerary, inclusions, exclusions")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Supabase packages error:", error.message);
          sendJson(res, 500, { error: "Failed to read packages" });
          return;
        }
        sendJson(res, 200, data || []);
      })
      .catch(err => {
        console.error("Supabase packages exception:", err);
        sendJson(res, 500, { error: "Failed to read packages" });
      });
    return;
  }

  if (req.method === "GET" && pathname === "/api/feedback/public") {
    if (!supabase) {
      sendJson(res, 200, []);
      return;
    }
    supabase
      .from("feedback")
      .select('id, "collegeName", "studentName", "foodRating", "travelRating", "placesRating", comments, "submittedDate"')
      .order("submittedDate", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Supabase feedback error:", error.message);
          sendJson(res, 200, []);
          return;
        }
        sendJson(res, 200, data || []);
      })
      .catch(() => {
        sendJson(res, 200, []);
      });
    return;
  }

  if (req.method === "GET" && pathname === "/api/feedback") {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    if (!supabase) {
      sendJson(res, 200, []);
      return;
    }
    supabase
      .from("feedback")
      .select('id, "collegeName", "studentName", "foodRating", "travelRating", "placesRating", comments, "submittedDate"')
      .order("submittedDate", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Supabase feedback error:", error.message);
          sendJson(res, 200, []);
          return;
        }
        sendJson(res, 200, data || []);
      })
      .catch(() => {
        sendJson(res, 200, []);
      });
    return;
  }

  if (req.method === "POST" && pathname === "/api/feedback") {
    readRequestBody(req).then(body => {
      const { collegeName, studentName, foodRating, travelRating, placesRating, comments } = body;

      // Validation
      if (!collegeName || typeof collegeName !== "string" || collegeName.trim() === "") {
        sendJson(res, 400, { error: "College name is required" });
        return;
      }
      if (!studentName || typeof studentName !== "string" || studentName.trim() === "") {
        sendJson(res, 400, { error: "Student name is required" });
        return;
      }

      const parseRating = (r) => {
        const num = Number(r);
        return (!isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 5) ? num : null;
      };

      const food = parseRating(foodRating);
      const travel = parseRating(travelRating);
      const places = parseRating(placesRating);

      if (food === null || travel === null || places === null) {
        sendJson(res, 400, { error: "Ratings for Food, Travel, and Places must be integers between 1 and 5" });
        return;
      }

      if (!supabase) {
        sendJson(res, 500, { error: "Database not configured" });
        return;
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

      supabase
        .from("feedback")
        .insert([newFeedback])
        .then(({ error }) => {
          if (error) {
            console.error("Supabase save feedback error:", error.message);
            sendJson(res, 500, { error: "Failed to save feedback" });
            return;
          }
          sendJson(res, 201, { success: true, feedback: newFeedback });
        })
        .catch(err => {
          console.error("Supabase save feedback exception:", err);
          sendJson(res, 500, { error: "Failed to save feedback" });
        });
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/login") {
    readRequestBody(req).then(body => {
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminToken = process.env.ADMIN_TOKEN;

      // Fail securely if environment variables are missing or empty
      if (
        !adminPassword ||
        typeof adminPassword !== "string" ||
        adminPassword.trim() === "" ||
        !adminToken ||
        typeof adminToken !== "string" ||
        adminToken.trim() === ""
      ) {
        console.error("Admin login error: ADMIN_PASSWORD or ADMIN_TOKEN environment variable is not configured.");
        sendJson(res, 500, { error: "Server authentication configuration error" });
        return;
      }

      const submittedPassword = (body && typeof body.password === "string") ? body.password : "";

      if (safeCompare(submittedPassword, adminPassword.trim())) {
        sendJson(res, 200, { token: adminToken.trim() });
      } else {
        sendJson(res, 401, { error: "Invalid password" });
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/packages") {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    readRequestBody(req).then(newPackage => {
      if (!supabase) {
        sendJson(res, 500, { error: "Database not configured" });
        return;
      }
      // Generate ID if not present
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

      supabase
        .from("packages")
        .insert([record])
        .then(({ error }) => {
          if (error) {
            console.error("Supabase insert package error:", error.message);
            sendJson(res, 500, { error: "Failed to save package" });
            return;
          }
          sendJson(res, 201, { success: true, package: newPackage });
        })
        .catch(err => {
          console.error("Supabase insert package exception:", err);
          sendJson(res, 500, { error: "Failed to save package" });
        });
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/packages/edit") {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    readRequestBody(req).then(async updatedPackage => {
      if (!supabase) {
        sendJson(res, 500, { error: "Database not configured" });
        return;
      }
      const packageId = updatedPackage.id;
      if (!packageId) {
        sendJson(res, 400, { error: "Package ID is required" });
        return;
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
          console.error("Supabase update package error:", error.message);
          sendJson(res, 500, { error: "Failed to update package" });
          return;
        }

        if (!data || data.length === 0) {
          sendJson(res, 404, { error: "Package not found" });
          return;
        }

        sendJson(res, 200, { success: true, package: updatedPackage });
      } catch (err) {
        console.error("Supabase edit package exception:", err);
        sendJson(res, 500, { error: "Failed to update package" });
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/packages/delete") {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    readRequestBody(req).then(async body => {
      const packageId = body && body.id;
      if (!packageId) {
        sendJson(res, 400, { error: "Package ID is required" });
        return;
      }
      if (!supabase) {
        sendJson(res, 500, { error: "Database not configured" });
        return;
      }

      try {
        const { data, error } = await supabase
          .from("packages")
          .delete()
          .eq("id", packageId)
          .select();

        if (error) {
          console.error("Supabase delete package error:", error.message);
          sendJson(res, 500, { error: "Failed to delete package" });
          return;
        }

        if (!data || data.length === 0) {
          sendJson(res, 404, { error: "Package not found" });
          return;
        }

        sendJson(res, 200, { success: true });
      } catch (err) {
        console.error("Supabase delete package exception:", err);
        sendJson(res, 500, { error: "Failed to delete package" });
      }
    });
    return;
  }

  // --- Static File Serving & Hardening ---
  // Block any path traversal attempts in raw URL or pathname
  if (req.url.includes("..") || req.url.includes("\\") || pathname.includes("..")) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  // Decode URL pathname and prevent URI malformation attacks
  let safePathname;
  try {
    safePathname = decodeURIComponent(pathname);
  } catch (e) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("400 Bad Request");
    return;
  }

  // Prevent null-byte injection
  if (safePathname.includes("\0")) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("400 Bad Request");
    return;
  }

  // Normalize path and set default index
  let relativePath = safePathname;
  if (relativePath === "/" || relativePath === "") {
    relativePath = "/index.html";
  }

  const rootPath = path.resolve(__dirname);
  // Normalize and resolve path inside workspace
  const resolvedPath = path.resolve(rootPath, "." + path.sep + path.normalize(relativePath));

  // Path Traversal Check: strictly enforce that resolvedPath is within rootPath
  if (resolvedPath !== rootPath && !resolvedPath.startsWith(rootPath + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  // Sensitive File Protection:
  // Disallow dotfiles (.env, .git, etc.), backend source files, and database JSON files
  const relFromRoot = path.relative(rootPath, resolvedPath);
  const pathParts = relFromRoot.split(path.sep);
  const filename = path.basename(resolvedPath).toLowerCase();

  const isDotFile = pathParts.some(part => part.startsWith("."));
  const isForbiddenFile =
    filename === "server.js" ||
    filename === "package.json" ||
    filename === "package-lock.json" ||
    filename.endsWith("-db.json") ||
    filename.endsWith(".db") ||
    filename.endsWith(".sqlite");

  if (isDotFile || isForbiddenFile) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  // Check if file exists
  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    // Determine content type
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Read and serve file with no-cache headers to ensure immediate updates
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    });
    const stream = fs.createReadStream(resolvedPath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  GK Holidays Local Server is running!`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Press Ctrl+C to stop the server.`);
  console.log(`==================================================`);
});
