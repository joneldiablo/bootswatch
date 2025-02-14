#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { purgeCss, watchFiles } = require("./purge-css");

const args = yargs(hideBin(process.argv))
  .option("input", {
    alias: 'i',
    type: "string",
    describe: "Path to the folder containing HTML files used for purging",
    demandOption: true,
  })
  .option("css", {
    alias: "c",
    type: "string",
    describe: "Path to the original css file",
    demandOption: true,
  })
  .option("output", {
    alias: "o",
    type: "string",
    describe: "Path to where the purged CSS file should be saved",
    demandOption: false,
  })
  .option("watch", {
    alias: "w",
    type: "boolean",
    describe: "Watch for changes and re-run PurgeCSS automatically",
    default: false,
  })
  .help()
  .alias("help", "h").argv;

try {
  const cssFilePath = args.css;
  const htmlFilePath = path.resolve(args.input);
  const outputCssFilePath = args.output
    ? path.resolve(args.output)
    : path.join(htmlFilePath, "style.css");

  if (args.watch) {
    console.log("👀 Starting in watch mode...");
    watchFiles(cssFilePath, htmlFilePath, outputCssFilePath);
  } else {
    purgeCss(cssFilePath, htmlFilePath, outputCssFilePath)
      .then(() => {
        console.log("✅ DONE");
        process.exit();
      })
      .catch((err) => {
        console.error("❌ ERROR:", err.message);
        process.exit(1);
      });
  }
} catch (error) {
  console.error("❌ ERROR:", error.message);
  process.exit(1);
}
