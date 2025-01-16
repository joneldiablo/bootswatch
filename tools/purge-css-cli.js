#! /usr/bin/env node
const path = require("path");
const fs = require("fs");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const purgeCss = require("./purge-css");

const args = yargs(hideBin(process.argv))
  .option("html", {
    type: "string",
    describe: "Path to the HTML file used for purging",
    demandOption: true,
  })
  .option("output", {
    alias: "o",
    type: "string",
    describe: "Path to where put the css file generated",
    demandOption: false,
  })
  .help()
  .alias("help", "h").argv;

try {
  const cssFilePath = "./dist/cpa/bootstrap.css";
  // Procesar el archivo HTML y generar el output CSS
  const htmlFilePath = path.resolve(args.html);
  const outputCssFilePath = args.output
    ? path.resolve(args.output)
    : htmlFilePath.replace(/\.html$/, ".css");

  purgeCss(cssFilePath, htmlFilePath, outputCssFilePath)
    .then(() => {
      console.log("DONE");
      process.exit();
    })
    .catch((err) => {
      console.error("ERROR:", err.message);
      process.exit(1);
    });
} catch (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
}
