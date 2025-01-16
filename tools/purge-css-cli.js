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
  .help()
  .alias("help", "h").argv;

try {
  const cssFilePath = "./dist/bootstrap.css";
  // Procesar el archivo HTML y generar el output CSS
  const htmlFilePath = path.resolve(args.html);
  const outputCssFilePath = htmlFilePath.replace(/\.html$/, ".css");

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
