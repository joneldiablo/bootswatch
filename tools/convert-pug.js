#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pug = require('pug');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const args = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    describe: 'Path to the directory containing Pug files',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    describe: 'Path to the output directory',
  })
  .option('watch', {
    alias: 'w',
    type: 'boolean',
    describe: 'Watch for changes and recompile automatically',
    default: false,
  })
  .help()
  .alias('help', 'h').argv;

const processDirectory = (inputDir, outputDir) => {
  const files = fs.readdirSync(inputDir);

  files.forEach(file => {
    const inputFilePath = path.join(inputDir, file);
    const outputFilePath = path.join(outputDir, file.replace(/\.pug$/, '.html'));
    const stat = fs.statSync(inputFilePath);

    if (stat.isDirectory()) {
      const newOutputDir = path.join(outputDir, file);
      if (!fs.existsSync(newOutputDir)) {
        fs.mkdirSync(newOutputDir, { recursive: true });
      }
      processDirectory(inputFilePath, newOutputDir);
    } else if (file.endsWith('.pug')) {
      compilePug(inputFilePath, outputFilePath);
    }
  });
};

const compilePug = (inputFilePath, outputFilePath) => {
  console.log(`Compiling: ${inputFilePath}`);
  const compiledFunction = pug.compileFile(inputFilePath, { pretty: true });
  const htmlOutput = compiledFunction();
  fs.writeFileSync(outputFilePath, htmlOutput, 'utf8');
  console.log(`✅ HTML generated: ${outputFilePath}`);
};

const watchFiles = (inputDir, outputDir) => {
  console.log('Watching for file changes...');
  const chokidar = require('chokidar');

  chokidar.watch(inputDir, { persistent: true, ignoreInitial: false, awaitWriteFinish: true })
    .on('add', filePath => {
      if (filePath.endsWith('.pug')) {
        const relativePath = path.relative(inputDir, filePath);
        const outputFilePath = path.join(outputDir, relativePath.replace(/\.pug$/, '.html'));
        compilePug(filePath, outputFilePath);
      }
    })
    .on('change', filePath => {
      if (filePath.endsWith('.pug')) {
        const relativePath = path.relative(inputDir, filePath);
        const outputFilePath = path.join(outputDir, relativePath.replace(/\.pug$/, '.html'));
        compilePug(filePath, outputFilePath);
      }
    });
};

const main = async (args) => {
  try {
    const inputDir = path.resolve(args.input);
    if (!fs.existsSync(inputDir) || !fs.statSync(inputDir).isDirectory()) {
      throw new Error('Input directory not found or is not a directory');
    }

    const outputDir = args.output ? path.resolve(args.output) : path.join(inputDir, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Scanning for Pug files recursively...');
    processDirectory(inputDir, outputDir);

    if (args.watch) {
      watchFiles(inputDir, outputDir);
    } else {
      console.log('✅ All Pug files processed successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
};

main(args)
  .then(() => {
    console.log('DONE');
    if (!args.watch) process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });