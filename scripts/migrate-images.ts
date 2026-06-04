import { google } from "googleapis";
import cloudinary from "cloudinary";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as https from "https";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({
    version: "v3",
    auth,
});

const FOLDER_ID = "1W5yrVao1hJTxBCCudIJplHE6-5eCm6Ji";

async function downloadFile(fileId: string, dest: string): Promise<void> {
    const authClient = await auth.getClient();
    const token = await authClient.getAccessToken();

    return new Promise((resolve, reject) => {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const file = fs.createWriteStream(dest);

        https.get(
            url,
            {
                headers: {
                    Authorization: `Bearer ${token.token}`,
                },
            },
            (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                    return;
                }
                res.pipe(file);
                file.on("finish", () => file.close(() => resolve()));
            }
        ).on("error", (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function getAllFiles() {
    const res = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and trashed = false`,
        fields: "files(id, name, mimeType, parents)",
        pageSize: 200,
    });
    return res.data.files || [];
}

async function getSubFolders() {
    const res = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name)",
        pageSize: 100,
    });
    return res.data.files || [];
}

async function getFilesInFolder(folderId: string) {
    const res = await drive.files.list({
        q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name, mimeType)",
        pageSize: 100,
    });
    return res.data.files || [];
}

async function uploadToCloudinary(filePath: string, publicId: string): Promise<string> {
    const result = await cloudinary.v2.uploader.upload(filePath, {
        public_id: publicId,
        folder: "surf-store/products",
        overwrite: true,
    });
    return result.secure_url;
}

async function main() {
    console.log("🏄 Starting migration from Google Drive to Cloudinary...\n");

    const results: Record<string, Record<string, string>> = {};

    // Cek apakah folder punya subfolder (per board) atau flat
    const subFolders = await getSubFolders();

    if (subFolders.length > 0) {
        // Struktur: folder utama → subfolder per board → gambar
        console.log(`📁 Found ${subFolders.length} board folders\n`);

        for (const folder of subFolders) {
            const boardName = folder.name!.toLowerCase().replace(/\s+/g, "-");
            console.log(`📦 Processing board: ${folder.name}`);
            results[boardName] = {};

            const files = await getFilesInFolder(folder.id!);

            for (const file of files) {
                const ext = path.extname(file.name!).toLowerCase() || ".jpg";
                const imageType = path.basename(file.name!, ext).toLowerCase().replace(/\s+/g, "-");
                const tempPath = path.join(os.tmpdir(), `${boardName}-${imageType}${ext}`);
                const publicId = `${boardName}-${imageType}`;

                try {
                    process.stdout.write(`  ↓ ${file.name}... `);
                    await downloadFile(file.id!, tempPath);
                    const url = await uploadToCloudinary(tempPath, publicId);
                    results[boardName][imageType] = url;
                    fs.unlinkSync(tempPath);
                    console.log(`✓`);
                } catch (err: any) {
                    console.log(`✗ ${err.message || err}`);
                    results[boardName][imageType] = "FAILED";
                }
            }
            console.log("");
        }
    } else {
        // Struktur flat: semua gambar langsung di folder utama
        console.log("📁 Flat structure detected, reading all files...\n");
        const files = await getAllFiles();

        for (const file of files) {
            const ext = path.extname(file.name!).toLowerCase() || ".jpg";
            const baseName = path.basename(file.name!, ext).toLowerCase().replace(/\s+/g, "-");
            const tempPath = path.join(os.tmpdir(), `${baseName}${ext}`);

            try {
                process.stdout.write(`  ↓ ${file.name}... `);
                await downloadFile(file.id!, tempPath);
                const url = await uploadToCloudinary(tempPath, baseName);
                results["flat"] = results["flat"] || {};
                results["flat"][baseName] = url;
                fs.unlinkSync(tempPath);
                console.log(`✓`);
            } catch (err) {
                console.log(`✗ ${err}`);
            }
        }
    }

    console.log("\n✅ Migration complete!\n");
    fs.writeFileSync("scripts/migration-results.json", JSON.stringify(results, null, 2));
    console.log("📄 Results saved to scripts/migration-results.json");
    console.log("💡 Use this file as reference when seeding the database.");
}

main().catch(console.error);