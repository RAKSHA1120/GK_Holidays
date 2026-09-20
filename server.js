const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

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

function isAuthorized(req) {
  const authHeader = req.headers["authorization"] || "";
  return authHeader === "Bearer gk-secret-admin-session-token-2026" || authHeader === "Bearer apex-secret-admin-session-token-2026";
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  console.log(`${req.method} ${pathname}`);

  // --- API Routing ---
  if (req.method === "GET" && pathname === "/api/settings") {
    fs.readFile(path.join(__dirname, "settings-db.json"), "utf8", (err, data) => {
      if (err) {
        const defaultSettings = {
          address: "C4, First Floor, Alayamani Enclave, Paari Nagar, Palayapalayam Pirivu, Erode - 638 011. Tamilnadu. India.",
          whatsapp: "918072812071",
          phoneNumbers: ["+91 8072 812 071", "+91 98428 79490", "+91 63800 21474"],
          email: "gkholidays@gmail.com",
          instagramHandle: "@gk_holidays_official",
          instagramUrl: "https://www.instagram.com/gk_holidays_official"
        };
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        });
        res.end(JSON.stringify(defaultSettings));
        return;
      }
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      });
      res.end(data);
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/settings") {
    if (!isAuthorized(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    readRequestBody(req).then(newSettings => {
      const dbPath = path.join(__dirname, "settings-db.json");
      fs.writeFile(dbPath, JSON.stringify(newSettings, null, 2), "utf8", (err) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to save settings" }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, settings: newSettings }));
      });
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/packages") {
    fs.readFile(path.join(__dirname, "packages-db.json"), "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to read packages" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/feedback/public") {
    fs.readFile(path.join(__dirname, "feedback-db.json"), "utf8", (err, data) => {
      if (err) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify([]));
        return;
      }
      let feedback = [];
      try {
        feedback = JSON.parse(data);
      } catch (e) {
        feedback = [];
      }
      // Sort by date descending
      feedback.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(feedback));
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/feedback") {
    if (!isAuthorized(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    fs.readFile(path.join(__dirname, "feedback-db.json"), "utf8", (err, data) => {
      if (err) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify([]));
        return;
      }
      let feedback = [];
      try {
        feedback = JSON.parse(data);
      } catch (e) {
        feedback = [];
      }
      // Sort by date descending
      feedback.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(feedback));
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/feedback") {
    readRequestBody(req).then(body => {
      const { collegeName, studentName, foodRating, travelRating, placesRating, comments } = body;
      
      // Validation
      if (!collegeName || typeof collegeName !== "string" || collegeName.trim() === "") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "College name is required" }));
        return;
      }
      if (!studentName || typeof studentName !== "string" || studentName.trim() === "") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Student name is required" }));
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
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Ratings for Food, Travel, and Places must be integers between 1 and 5" }));
        return;
      }
      
      const dbPath = path.join(__dirname, "feedback-db.json");
      fs.readFile(dbPath, "utf8", (err, data) => {
        let feedbackList = [];
        if (!err && data) {
          try {
            feedbackList = JSON.parse(data);
          } catch (e) {
            feedbackList = [];
          }
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
        
        feedbackList.push(newFeedback);
        
        fs.writeFile(dbPath, JSON.stringify(feedbackList, null, 2), "utf8", (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to save feedback" }));
            return;
          }
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, feedback: newFeedback }));
        });
      });
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/login") {
    readRequestBody(req).then(body => {
      if (body.password === "GKAdmin2026" || body.password === "ApexAdmin2026") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ token: "gk-secret-admin-session-token-2026" }));
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid password" }));
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/packages") {
    if (!isAuthorized(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    readRequestBody(req).then(newPackage => {
      const dbPath = path.join(__dirname, "packages-db.json");
      fs.readFile(dbPath, "utf8", (err, data) => {
        let packages = [];
        if (!err && data) {
          try { packages = JSON.parse(data); } catch(e){}
        }
        // Generate ID if not present
        if (!newPackage.id) {
          newPackage.id = newPackage.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }
        packages.push(newPackage);
        fs.writeFile(dbPath, JSON.stringify(packages, null, 2), "utf8", (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to save package" }));
            return;
          }
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, package: newPackage }));
         });
      });
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/packages/edit") {
    if (!isAuthorized(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    readRequestBody(req).then(updatedPackage => {
      const dbPath = path.join(__dirname, "packages-db.json");
      fs.readFile(dbPath, "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to read database" }));
          return;
        }
        let packages = [];
        if (!err && data) {
          try { packages = JSON.parse(data); } catch(e){}
        }
        const index = packages.findIndex(p => p.id === updatedPackage.id);
        if (index === -1) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Package not found" }));
          return;
        }
        packages[index] = updatedPackage;
        fs.writeFile(dbPath, JSON.stringify(packages, null, 2), "utf8", (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to update package" }));
            return;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, package: updatedPackage }));
        });
      });
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/packages/delete") {
    if (!isAuthorized(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    readRequestBody(req).then(body => {
      const packageId = body.id;
      if (!packageId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Package ID is required" }));
        return;
      }
      const dbPath = path.join(__dirname, "packages-db.json");
      fs.readFile(dbPath, "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to read database" }));
          return;
        }
        let packages = [];
        try { packages = JSON.parse(data); } catch(e){}
        const initialLength = packages.length;
        packages = packages.filter(p => p.id !== packageId);
        if (packages.length === initialLength) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Package not found" }));
          return;
        }
        fs.writeFile(dbPath, JSON.stringify(packages, null, 2), "utf8", (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to delete package" }));
            return;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        });
      });
    });
    return;
  }

  // Normalize URL path
  let filePath = "." + pathname;
  if (filePath === "./" || filePath === ".") {
    filePath = "./index.html";
  }

  // Resolve absolute path and ensure it's inside the workspace
  const resolvedPath = path.resolve(filePath);
  const rootPath = path.resolve(".");

  if (!resolvedPath.startsWith(rootPath)) {
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
