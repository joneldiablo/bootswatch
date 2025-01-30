#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const html2pug = require('html2pug');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const args = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    describe: 'Path to the HTML file',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    describe: 'Path to save the converted Pug file',
  })
  .option('tabs', {
    alias: 't',
    type: 'boolean',
    describe: 'Use tabs instead of spaces for indentation',
    default: false,
  })
  .help()
  .alias('help', 'h').argv;

const main = async (args) => {
  try {
    // Validar que el archivo HTML existe
    const htmlFilePath = path.resolve(args.input);
    if (!fs.existsSync(htmlFilePath)) throw new Error('HTML file not found');

    console.log('Converting HTML to Pug...');

    // Leer el archivo HTML
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

    // Convertir a Pug
    const pugOutput = html2pug(htmlContent, { tabs: args.tabs });

    // Definir ruta de salida
    const outputFilePath = args.output
      ? path.resolve(args.output)
      : htmlFilePath.replace(/\.html$/, '.pug');

    // Guardar el archivo convertido
    fs.writeFileSync(outputFilePath, pugOutput, 'utf8');

    console.log(`✅ Pug generated: ${outputFilePath}`);
    return true;
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
};

main(args)
  .then(() => {
    console.log('DONE');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
