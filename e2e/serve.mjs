/**
 * Dependency-free static file server for the e2e suite.
 *
 * Serves the demo/ directory. Replace SERVE_DIR (or set it via env) to point
 * the gate at your own built site — anything that ends up as static
 * HTML/CSS/JS can be scanned this way. For a framework dev server, delete
 * this file and change webServer.command in playwright.config.js instead.
 */
import http from "node:http";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVE_DIR = path.resolve(HERE, "..", process.env.SERVE_DIR ?? "demo");
const PORT = Number(process.env.A11Y_PORT ?? 8901);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".vtt": "text/vtt",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let filePath = path.normalize(path.join(SERVE_DIR, decodeURIComponent(url.pathname)));

    if (!filePath.startsWith(SERVE_DIR)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    let stat = await fs.stat(filePath).catch(() => null);
    if (stat?.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      stat = await fs.stat(filePath).catch(() => null);
    }
    if (!stat) {
      res.writeHead(404).end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": stat.size,
    });
    createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500).end(String(err));
  }
});

server.listen(PORT, () => {
  console.log(`a11y gate server: http://localhost:${PORT}/ (dir: ${SERVE_DIR})`);
});
