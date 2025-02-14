#!/usr/bin/env node
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { processDirectory, compilePug, watchFiles: watchPug } = require('./convert-pug');
const { purgeCss, watchFiles: watchCss } = require('./purge-css');

const args = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    describe: 'Path to the Pug file or directory',
    demandOption: true,
  })
  .option('css', {
    alias: 'c',
    type: 'string',
    describe: 'Path to the original CSS file',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    describe: 'Path to the output directory for HTML',
    demandOption: true,
  })
  .option('outputCss', {
    alias: 'u',
    type: 'string',
    describe: 'Path to the output purged CSS',
    demandOption: true,
  })
  .option('watch', {
    alias: 'w',
    type: 'boolean',
    describe: 'Watch for changes and reprocess automatically',
    default: false,
  })
  .help()
  .alias('help', 'h').argv;

const main = async (args) => {

  const inputPath = path.resolve(args.input);
  const cssFilePath = path.resolve(args.css);
  const outputPath = path.resolve(args.output);

  if (!fs.existsSync(inputPath)) {
    throw new Error('❌ Input file or directory not found');
  }
  if (!fs.existsSync(cssFilePath)) {
    throw new Error('❌ CSS file not found');
  }
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  console.log('📂 Processing Pug files...');
  if (fs.statSync(inputPath).isDirectory()) {
    processDirectory(inputPath, outputPath);
  } else {
    const outputHtml = path.join(outputPath, path.basename(inputPath).replace(/\.pug$/, '.html'));
    compilePug(inputPath, outputHtml);
  }

  console.log('🧹 Purging CSS...');
  await purgeCss(cssFilePath, outputPath, args.outputCss);

  if (args.watch) {
    console.log('👀 Watching Pug and HTML files for changes...');
    watchPug(inputPath, outputPath);
    watchCss(cssFilePath, outputPath, args.outputCss);
  } else {
    console.log('✅ All files processed successfully');
    process.exit();
  }
};

main(args).catch((err) => {
  console.error('❌ ERROR:', err);
  process.exit(1);
});
