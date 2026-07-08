import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import _multer from "multer";

const multer = (_multer as any).default || _multer;

const hasImportMeta = typeof import.meta !== "undefined" && !!import.meta.url;
const __filename = hasImportMeta ? fileURLToPath(import.meta.url) : "";
const __dirname = hasImportMeta ? path.dirname(__filename) : "";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure portfolio directory exists
  const portfolioDir = path.join(process.cwd(), "public", "images", "portfolio");
  if (!fs.existsSync(portfolioDir)) {
    fs.mkdirSync(portfolioDir, { recursive: true });
  }

  // Ensure legacy uploads directory exists
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Ensure logo directory exists
  const logoDir = path.join(process.cwd(), "public", "images", "logo");
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }

  // Ensure perfil directory exists
  const perfilDir = path.join(process.cwd(), "public", "images", "perfil");
  if (!fs.existsSync(perfilDir)) {
    fs.mkdirSync(perfilDir, { recursive: true });
  }

  // Multer configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, portfolioDir);
    },
    filename: (req, file, cb) => {
      // Create a unique safe filename with original extension
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
      const timestamp = Date.now();
      cb(null, `portfolio_${timestamp}_${name}${ext}`);
    }
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB max file size (useful for videos)
    }
  });

  // Multer logo configuration
  const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, logoDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
      const timestamp = Date.now();
      cb(null, `logo_${timestamp}_${name}${ext}`);
    }
  });

  const uploadLogoInstance = multer({
    storage: logoStorage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  // Multer perfil configuration
  const perfilStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, perfilDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
      const timestamp = Date.now();
      cb(null, `profile_${timestamp}_${name}${ext}`);
    }
  });

  const uploadPerfilInstance = multer({
    storage: perfilStorage,
    limits: {
      fileSize: 15 * 1024 * 1024 // 15MB limit
    }
  });

  // Support JSON and urlencoded body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: File Upload
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No se subió ningún archivo." });
        return;
      }
      // Return the public relative URL
      const relativeUrl = `/images/portfolio/${req.file.filename}`;
      res.json({ url: relativeUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Error al subir el archivo." });
    }
  });

  // API Route: Logo Upload
  app.post("/api/upload-logo", uploadLogoInstance.single("file"), (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No se subió ningún archivo." });
        return;
      }
      // Return the public relative URL pointing to the public/images/logo folder
      const relativeUrl = `/images/logo/${req.file.filename}`;
      res.json({ url: relativeUrl });
    } catch (error: any) {
      console.error("Logo upload error:", error);
      res.status(500).json({ error: error.message || "Error al subir el logo." });
    }
  });

  // API Route: Profile Upload
  app.post("/api/upload-profile", uploadPerfilInstance.single("file"), (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No se subió ningún archivo." });
        return;
      }
      // Return the public relative URL pointing to the public/images/perfil folder
      const relativeUrl = `/images/perfil/${req.file.filename}`;
      res.json({ url: relativeUrl });
    } catch (error: any) {
      console.error("Profile upload error:", error);
      res.status(500).json({ error: error.message || "Error al subir la foto de perfil." });
    }
  });

  // API Route: Save Portfolio Data back to local initialPortfolioData.ts (enables persistent changes for Vercel deploys)
  app.post("/api/save-portfolio-data", (req, res) => {
    try {
      const data = req.body;
      if (!data) {
        res.status(400).json({ error: "No se recibieron datos." });
        return;
      }
      
      const filePath = path.join(process.cwd(), "src", "initialPortfolioData.ts");
      const fileContent = `import { PortfolioData } from './types';\n\nexport const defaultPortfolioData: PortfolioData = ${JSON.stringify(data, null, 2)};\n`;
      
      fs.writeFileSync(filePath, fileContent, "utf-8");
      console.log("Sincronizado correctamente initialPortfolioData.ts con los nuevos cambios.");
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error al escribir initialPortfolioData.ts:", error);
      res.status(500).json({ error: error.message || "Error al escribir initialPortfolioData.ts" });
    }
  });

  // Serve uploaded images/videos statically in both environments
  app.use("/uploads", express.static(uploadDir));
  app.use("/images", express.static(path.join(process.cwd(), "public", "images")));
  app.use("/videos", express.static(path.join(process.cwd(), "public", "videos")));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Custom JSON error handler to catch all Express and Multer errors and return them as JSON
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Express App Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Error interno del servidor"
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting fullstack server:", err);
});
