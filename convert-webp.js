const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");
const fileDialog = require("node-file-dialog");

const validExtensions = [".jpg", ".jpeg", ".png"];

async function convertImage(inputPath, outputPath) {
  try {
    await sharp(inputPath).webp({ quality: 75 }).toFile(outputPath);
    console.log(`✅ ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error al convertir ${inputPath}:`, error.message);
  }
}

async function processFolder(folderPath, baseInput, baseOutput) {
  const items = await fs.readdir(folderPath);

  for (const item of items) {
    const inputItemPath = path.join(folderPath, item);
    const relativePath = path.relative(baseInput, inputItemPath);
    const outputItemPath = path.join(baseOutput, relativePath);

    const stat = await fs.stat(inputItemPath);

    if (stat.isDirectory()) {
      await fs.ensureDir(outputItemPath);
      await processFolder(inputItemPath, baseInput, baseOutput);
    } else if (validExtensions.includes(path.extname(item).toLowerCase())) {
      const outputWebp = outputItemPath.replace(path.extname(item), ".webp");
      await convertImage(inputItemPath, outputWebp);
    }
  }
}

async function main() {
  console.log("📂 Selecciona la carpeta de entrada...");
  const input = await fileDialog({ type: "directory" });
  const inputDir = path.resolve(input[0]);

  console.log("📁 Selecciona la carpeta de salida...");
  const output = await fileDialog({ type: "directory" });
  const outputDir = path.resolve(output[0]);

  console.log(`✅ Carpeta origen: ${inputDir}`);
  console.log(`✅ Carpeta destino: ${outputDir}`);

  await fs.ensureDir(outputDir);
  await processFolder(inputDir, inputDir, outputDir);

  console.log("🎉 Conversión finalizada.");
}

main().catch(console.error);
