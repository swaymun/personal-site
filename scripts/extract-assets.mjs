/**
 * Xbox 360 UI Asset Extraction Script
 * Uses Qwen VL via Replicate to analyze reference frames
 *
 * Setup:
 * 1. npm install replicate
 * 2. Create .env file with: REPLICATE_API_TOKEN=your_token_here
 * 3. Run: node scripts/extract-assets.mjs
 */

import Replicate from "replicate";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Initialize Replicate client (reads REPLICATE_API_TOKEN from env)
const replicate = new Replicate();

// Frame analysis tasks
const EXTRACTIONS = [
  {
    frame: "0055.png",
    prompt: `Analyze this Xbox 360 dashboard screenshot and extract the following design specifications:
1. Background gradient: List the hex color values from top to bottom
2. Tile colors: The green color used for tiles (hex)
3. Tile title bar: The darker green for the title section (hex)
4. Text colors: Primary white and secondary gray colors (hex)
Return the results as a JSON object.`,
    output: "color-specs.json",
  },
  {
    frame: "0055.png",
    prompt: `Analyze the tile layout in this Xbox 360 dashboard:
1. Describe each tile's position and approximate dimensions
2. What is the gap between tiles?
3. What is the layout pattern (e.g., large tile on left, 2x2 grid on right)?
Return structured information about the tile layout.`,
    output: "tile-layout.json",
  },
  {
    frame: "0104.png",
    prompt: `Analyze the navigation bar in this Xbox 360 dashboard:
1. List all the navigation tab labels visible
2. Describe the typography: font weight for active vs inactive tabs
3. What is the spacing between tabs?
4. Describe the user info area on the right (gamertag, icons)
Return detailed navigation specifications.`,
    output: "nav-specs.json",
  },
  {
    frame: "0046.png",
    prompt: `Analyze the tile hover/selection state in this Xbox 360 dashboard:
1. How does the selected tile differ from unselected tiles?
2. Is there a shadow, scale change, or position offset?
3. Describe the visual feedback for selection.
Return specifications for the tile hover effect.`,
    output: "hover-specs.json",
  },
];

async function extractAssets() {
  console.log("🎮 Xbox 360 UI Asset Extraction\n");

  // Ensure output directory exists
  const outputDir = path.join(rootDir, "src", "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const task of EXTRACTIONS) {
    console.log(`📸 Analyzing ${task.frame}...`);

    const imagePath = path.join(
      rootDir,
      "public",
      "xbox-360-home-screen-reference",
      "frames",
      task.frame
    );

    if (!fs.existsSync(imagePath)) {
      console.log(`  ⚠️  Frame not found: ${imagePath}`);
      continue;
    }

    try {
      // Read image as base64
      const imageData = fs.readFileSync(imagePath);
      const base64 = imageData.toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      // Call Qwen VL via Replicate
      const output = await replicate.run("lucataco/qwen2-vl-7b-instruct:5a524df8a7b0e6755f9847d31c00649c74d3e008db2c008b43e3b4d7d5e7b9ea", {
        input: {
          image: dataUrl,
          prompt: task.prompt,
        },
      });

      // Save results
      const outputPath = path.join(outputDir, task.output);
      const result = {
        frame: task.frame,
        prompt: task.prompt,
        response: output,
        timestamp: new Date().toISOString(),
      };

      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log(`  ✅ Saved to ${task.output}`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log("\n🎉 Asset extraction complete!");
  console.log(`Results saved to: ${outputDir}`);
}

// Run extraction
extractAssets().catch(console.error);
