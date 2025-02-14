const fs = require('fs');
const path = require('path');
const pug = require('pug');
const chokidar = require('chokidar');

/**
 * Recursively processes a directory, compiling Pug files to HTML.
 * @param {string} inputDir - Path to the directory containing Pug files.
 * @param {string} outputDir - Path to the output directory.
 */
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

/**
 * Compiles a single Pug file into an HTML file.
 * @param {string} inputFilePath - Path to the Pug file.
 * @param {string} outputFilePath - Path to save the generated HTML.
 */
const compilePug = (inputFilePath, outputFilePath) => {
  console.log(`Compiling: ${inputFilePath}`);
  const compiledFunction = pug.compileFile(inputFilePath, { pretty: true });
  const htmlOutput = compiledFunction();
  fs.writeFileSync(outputFilePath, htmlOutput, 'utf8');
  console.log(`✅ HTML generated: ${outputFilePath}`);
};

/**
 * Watches a directory for changes and recompiles Pug files on modification.
 * @param {string} inputDir - Path to the directory to watch.
 * @param {string} outputDir - Path to the output directory.
 */
const watchFiles = (inputDir, outputDir) => {
  console.log('Watching for file changes...');

  chokidar.watch(inputDir, { 
    persistent: true, 
    ignoreInitial: false, 
    awaitWriteFinish: true, 
    usePolling: true,  
    interval: 1000,  
  })
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

module.exports = {
  processDirectory,
  compilePug,
  watchFiles
};
