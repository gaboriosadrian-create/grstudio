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

  // Ensure source persistent directories exist
  const srcImagesDir = path.join(process.cwd(), "src", "images");
  const srcPortfolioDir = path.join(srcImagesDir, "portfolio");
  const srcLogoDir = path.join(srcImagesDir, "logo");
  const srcPerfilDir = path.join(srcImagesDir, "perfil");

  if (!fs.existsSync(srcPortfolioDir)) fs.mkdirSync(srcPortfolioDir, { recursive: true });
  if (!fs.existsSync(srcLogoDir)) fs.mkdirSync(srcLogoDir, { recursive: true });
  if (!fs.existsSync(srcPerfilDir)) fs.mkdirSync(srcPerfilDir, { recursive: true });

  // Ensure public ephemeral directories exist
  const publicImagesDir = path.join(process.cwd(), "public", "images");
  const portfolioDir = path.join(publicImagesDir, "portfolio");
  const logoDir = path.join(publicImagesDir, "logo");
  const perfilDir = path.join(publicImagesDir, "perfil");

  if (!fs.existsSync(portfolioDir)) fs.mkdirSync(portfolioDir, { recursive: true });
  if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });
  if (!fs.existsSync(perfilDir)) fs.mkdirSync(perfilDir, { recursive: true });

  // Ensure legacy uploads directory exists
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Double-direction directory synchronizer (keeps src/images and public/images merged and persistent)
  function syncFoldersSync(dirA: string, dirB: string) {
    if (!fs.existsSync(dirA)) fs.mkdirSync(dirA, { recursive: true });
    if (!fs.existsSync(dirB)) fs.mkdirSync(dirB, { recursive: true });

    // Copy from A to B if B doesn't have it
    fs.readdirSync(dirA).forEach((element) => {
      const pathA = path.join(dirA, element);
      const pathB = path.join(dirB, element);
      if (fs.lstatSync(pathA).isDirectory()) {
        syncFoldersSync(pathA, pathB);
      } else {
        if (!fs.existsSync(pathB)) {
          fs.copyFileSync(pathA, pathB);
          console.log(`Restored/Synced file to public: ${element}`);
        }
      }
    });

    // Copy from B to A if A doesn't have it
    fs.readdirSync(dirB).forEach((element) => {
      const pathA = path.join(dirA, element);
      const pathB = path.join(dirB, element);
      if (!fs.lstatSync(pathB).isDirectory()) {
        if (!fs.existsSync(pathA)) {
          fs.copyFileSync(pathB, pathA);
          console.log(`Persisted/Synced file to src: ${element}`);
        }
      }
    });
  }

  // Perform bi-directional sync on startup
  try {
    syncFoldersSync(srcImagesDir, publicImagesDir);
    console.log("Sincronización bidireccional de imágenes completada con éxito.");
  } catch (syncErr) {
    console.error("Error durante la sincronización inicial de imágenes:", syncErr);
  }

  // Helper function to save any image (Base64 or external URL) locally inside the project structure
  async function saveImageLocally(
    urlOrBase64: string, 
    folderName: "portfolio" | "logo" | "perfil",
    projectId?: string,
    imageIndex?: string | number,
    fileType?: string
  ): Promise<string> {
    if (!urlOrBase64) return "";
    const trimmed = urlOrBase64.trim();

    // If it is already a local relative path, return it as is
    if (trimmed.startsWith(`/images/${folderName}/`)) {
      return trimmed;
    }

    // Rule: Automatically detect and clean any path that contains /images/<folderName>/<filename>
    const cleanMatch = trimmed.match(/\/images\/(portfolio|logo|perfil)\/([^/]+)$/i);
    if (cleanMatch) {
      return `/images/${cleanMatch[1]}/${cleanMatch[2]}`;
    }

    const imagesDir = path.join(process.cwd(), "public", "images", folderName);
    const srcImagesDir = path.join(process.cwd(), "src", "images", folderName);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    if (!fs.existsSync(srcImagesDir)) {
      fs.mkdirSync(srcImagesDir, { recursive: true });
    }

    // Determine the fixed base name
    let baseName = "";
    if (folderName === "portfolio") {
      const pId = projectId || "temp";
      const imgIdx = imageIndex !== undefined ? imageIndex : "0";
      if (fileType === "video") {
        baseName = `portfolio-${pId}-video`;
      } else {
        baseName = `portfolio-${pId}-img-${imgIdx}`;
      }
    } else {
      baseName = `${folderName}-${projectId || "fixed"}`;
    }

    let ext = "png";

    // Case 1: Base64 data URI
    if (trimmed.startsWith("data:image/")) {
      try {
        const match = trimmed.match(/^data:image\/([a-zA-Z+.-]+);base64,(.+)$/);
        if (match) {
          const mime = match[1];
          if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
          else if (mime.includes("gif")) ext = "gif";
          else if (mime.includes("svg")) ext = "svg";
          else if (mime.includes("webp")) ext = "webp";
          
          const base64Data = match[2];
          const filename = `${baseName}.${ext}`;
          const destPath = path.join(imagesDir, filename);
          const srcDestPath = path.join(srcImagesDir, filename);

          // Delete other file extensions before writing (to avoid orphan files)
          try {
            const dirsToClean = [imagesDir, srcImagesDir];
            for (const d of dirsToClean) {
              if (fs.existsSync(d)) {
                const files = fs.readdirSync(d);
                for (const f of files) {
                  const fExt = path.extname(f).toLowerCase();
                  const fBase = path.basename(f, fExt);
                  if (fBase === baseName && fExt !== `.${ext}`) {
                    const oldPath = path.join(d, f);
                    fs.unlinkSync(oldPath);
                    console.log(`Deleted orphan/old file with different extension in saveImageLocally: ${oldPath}`);
                  }
                }
              }
            }
          } catch (e) {
            console.error("Error unlinking old file in saveImageLocally:", e);
          }

          fs.writeFileSync(destPath, Buffer.from(base64Data, "base64"));
          fs.writeFileSync(srcDestPath, Buffer.from(base64Data, "base64"));
          console.log(`Saved Base64 image locally to public and src: /images/${folderName}/${filename}`);
          return `/images/${folderName}/${filename}`;
        }
      } catch (err) {
        console.error("Error saving Base64 image:", err);
      }
    }

    // Case 2: External HTTP/HTTPS URL
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        console.log(`Downloading external image: ${trimmed}`);
        const res = await fetch(trimmed);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          try {
            const urlPath = new URL(trimmed).pathname;
            const parsedExt = path.extname(urlPath);
            if (parsedExt && parsedExt.length > 1) {
              ext = parsedExt.substring(1).toLowerCase();
            }
          } catch (e) {
            // fallback
          }

          const filename = `${baseName}.${ext}`;
          const destPath = path.join(imagesDir, filename);
          const srcDestPath = path.join(srcImagesDir, filename);

          // Delete other file extensions before writing (to avoid orphan files)
          try {
            const dirsToClean = [imagesDir, srcImagesDir];
            for (const d of dirsToClean) {
              if (fs.existsSync(d)) {
                const files = fs.readdirSync(d);
                for (const f of files) {
                  const fExt = path.extname(f).toLowerCase();
                  const fBase = path.basename(f, fExt);
                  if (fBase === baseName && fExt !== `.${ext}`) {
                    const oldPath = path.join(d, f);
                    fs.unlinkSync(oldPath);
                    console.log(`Deleted orphan/old file with different extension in saveImageLocally: ${oldPath}`);
                  }
                }
              }
            }
          } catch (e) {
            console.error("Error unlinking old file in saveImageLocally:", e);
          }

          fs.writeFileSync(destPath, buffer);
          fs.writeFileSync(srcDestPath, buffer);
          console.log(`Successfully downloaded and saved external image to public and src: /images/${folderName}/${filename}`);
          return `/images/${folderName}/${filename}`;
        } else {
          console.warn(`Failed to download external image: ${trimmed}. Status: ${res.statusText}`);
        }
      } catch (err) {
        console.error(`Error downloading external image ${trimmed}:`, err);
      }
    }

    // Case 3: Local uploads path (uploaded during current session)
    if (trimmed.startsWith("/uploads/")) {
      try {
        const filename = trimmed.substring("/uploads/".length);
        const sourcePath = path.join(process.cwd(), "uploads", filename);
        if (fs.existsSync(sourcePath)) {
          const parsedExt = path.extname(filename).toLowerCase();
          if (parsedExt && parsedExt.length > 1) {
            ext = parsedExt.substring(1);
          }
          const localFilename = `${baseName}.${ext}`;
          const destPath = path.join(imagesDir, localFilename);
          const srcDestPath = path.join(srcImagesDir, localFilename);

          // Copy files from uploads/ to public/images and src/images
          fs.copyFileSync(sourcePath, destPath);
          fs.copyFileSync(sourcePath, srcDestPath);
          console.log(`Successfully localized uploaded file from uploads to public and src: /images/${folderName}/${localFilename}`);
          return `/images/${folderName}/${localFilename}`;
        }
      } catch (err) {
        console.error("Error localizing uploads file:", err);
      }
    }

    return urlOrBase64;
  }

  // Multer configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
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
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
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
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
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
      
      console.log(`Uploaded file saved to uploads directory: ${req.file.filename}`);

      // Return the public relative URL under /uploads (which is not watched)
      const relativeUrl = `/uploads/${req.file.filename}`;
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

      console.log(`Uploaded logo saved to uploads directory: ${req.file.filename}`);

      // Return the public relative URL under /uploads (which is not watched)
      const relativeUrl = `/uploads/${req.file.filename}`;
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

      console.log(`Uploaded profile saved to uploads directory: ${req.file.filename}`);

      // Return the public relative URL under /uploads (which is not watched)
      const relativeUrl = `/uploads/${req.file.filename}`;
      res.json({ url: relativeUrl });
    } catch (error: any) {
      console.error("Profile upload error:", error);
      res.status(500).json({ error: error.message || "Error al subir la foto de perfil." });
    }
  });

  // API Route: Save Portfolio Data back to local initialPortfolioData.ts (enables persistent changes for Vercel deploys)
  app.post("/api/save-portfolio-data", async (req, res) => {
    try {
      const data = req.body;
      if (!data) {
        res.status(400).json({ error: "No se recibieron datos." });
        return;
      }

      console.log("Processing and localizing images inside save-portfolio-data...");
      
      // 1. Process profile images
      if (data.profile) {
        if (data.profile.logoUrl) {
          data.profile.logoUrl = await saveImageLocally(data.profile.logoUrl, "logo");
        }
        if (data.profile.profilePhotoUrl) {
          data.profile.profilePhotoUrl = await saveImageLocally(data.profile.profilePhotoUrl, "perfil");
        }
      }

       // 2. Process projects images
      if (Array.isArray(data.projects)) {
        for (let i = 0; i < data.projects.length; i++) {
          const project = data.projects[i];
          const pId = project.id || `index-${i}`;
          if (project.imageUrl) {
            project.imageUrl = await saveImageLocally(project.imageUrl, "portfolio", pId, "0", "image");
          }
          if (project.videoUrl) {
            project.videoUrl = await saveImageLocally(project.videoUrl, "portfolio", pId, "0", "video");
          }
          if (Array.isArray(project.imageUrls)) {
            const processedUrls: string[] = [];
            for (let j = 0; j < project.imageUrls.length; j++) {
              if (project.imageUrls[j]) {
                const localUrl = await saveImageLocally(project.imageUrls[j], "portfolio", pId, j.toString(), "image");
                processedUrls.push(localUrl);
              }
            }
            project.imageUrls = processedUrls;
          }
        }
      }
      
      const filePath = path.join(process.cwd(), "src", "initialPortfolioData.ts");
      const fileContent = `import { PortfolioData } from './types.ts';\n\nexport const defaultPortfolioData: PortfolioData = ${JSON.stringify(data, null, 2)};\n`;
      
      fs.writeFileSync(filePath, fileContent, "utf-8");
      console.log("Sincronizado correctamente initialPortfolioData.ts con los nuevos cambios e imágenes localizadas.");
      res.json({ success: true, data });
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
