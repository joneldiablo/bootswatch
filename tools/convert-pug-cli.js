#!/usr/bin/env node
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { processDirectory, compilePug, watchFiles } = require('./convert-pug');

const args = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    describe: 'Path to the Pug file or directory',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    describe: 'Path to the output directory or file',
  })
  .option('watch', {
    alias: 'w',
    type: 'boolean',
    describe: 'Watch for changes and recompile automatically',
    default: false,
  })
  .help()
  .alias('help', 'h').argv;

const main = async (args) => {
  try {
    const inputPath = path.resolve(args.input);

    if (!fs.existsSync(inputPath)) {
      throw new Error('❌ Input file or directory not found');
    }

    let outputPath = args.output ? path.resolve(args.output) : null;

    if (fs.statSync(inputPath).isDirectory()) {
      // Modo directorio
      outputPath = outputPath || inputPath; // Si no hay output, usa el mismo inputPath
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      console.log('📂 Scanning for Pug files recursively...');
      processDirectory(inputPath, outputPath);

      if (args.watch) {
        console.log('👀 Watching directory for changes...');
        watchFiles(inputPath, outputPath);
      } else {
        console.log('✅ All Pug files processed successfully');
      }
    } else {
      // Modo archivo único
      if (!outputPath) {
        outputPath = inputPath.replace(/\.pug$/, '.html'); // Generar HTML en el mismo lugar
      } else if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory()) {
        outputPath = path.join(outputPath, path.basename(inputPath).replace(/\.pug$/, '.html'));
      }

      compilePug(inputPath, outputPath);
      
      if (args.watch) {
        console.log(`👀 Watching file: ${inputPath}`);
        fs.watchFile(inputPath, { interval: 1000 }, () => {
          console.log(`🔄 File changed: ${inputPath}`);
          compilePug(inputPath, outputPath);
        });
      } else {
        console.log('✅ Pug file processed successfully');
      }
    }
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
};

main(args)
  .then(() => {
    console.log('✅ DONE');
    if (!args.watch) process.exit();
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
