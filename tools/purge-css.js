const path = require("path");
const fs = require("fs");
const { PurgeCSS } = require("purgecss");
const prettier = require("prettier");

/**
 * Purges unused CSS based on HTML content.
 *
 * @param {string} cssFilePath - Path to the CSS file generated by the build.
 * @param {string} htmlDirPath - Directory containing the generated HTML files.
 * @param {string} outputCssFilePath - Path to save the purged CSS.
 */
const purgeCss = async (cssFilePath, htmlDirPath, outputCssFilePath) => {
  try {
    // Ensure input files exist
    if (!fs.existsSync(cssFilePath)) throw new Error("CSS file not found");
    if (!fs.existsSync(htmlDirPath)) throw new Error("HTML directory not found");

    console.log("Purging unused CSS...");

    // Step 1: Use PurgeCSS to remove unused styles
    const purgeCSSResult = await new PurgeCSS().purge({
      content: [`${htmlDirPath}`], // Analyze all HTML files in the directory
      css: [cssFilePath], // CSS file generated by the build
      safelist: ['active', 'show']
    });

    if (!purgeCSSResult || purgeCSSResult.length === 0) {
      throw new Error("PurgeCSS failed to produce results.");
    }

    const purgedCss = purgeCSSResult[0].css;

    console.log("Formatting CSS...");
    // Step 2: Format CSS using Prettier
    const formattedCss = await prettier.format(purgedCss, { parser: "css" });

    console.log("Writing purged CSS to output...");
    // Step 3: Write the formatted CSS to the output file
    fs.writeFileSync(outputCssFilePath, formattedCss, "utf8");

    console.log(`Purged CSS written to: ${outputCssFilePath}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = purgeCss;
