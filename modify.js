const fs = require('fs');
const path = require('path');

const directoriesToDelete = [
  path.join(__dirname, 'src', 'controllers', 'new'),
  path.join(__dirname, 'src', 'services', 'new'),
  path.join(__dirname, 'src', 'dtos', 'new'),
  path.join(__dirname, 'src', 'entities', 'new'),
];

const filesToModify = [
  path.join(__dirname, 'src', 'controllers', 'index.ts'),
  path.join(__dirname, 'src', 'services', 'index.ts'),
  path.join(__dirname, 'src', 'entities', 'index.ts'),
];

// Función para eliminar carpetas
const deleteDirectories = (directories) => {
  directories.forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((file) => {
        const currentPath = path.join(dir, file);
        if (fs.lstatSync(currentPath).isDirectory()) {
          fs.rmdirSync(currentPath, { recursive: true });
        } else {
          fs.unlinkSync(currentPath);
        }
      });
      fs.rmdirSync(dir);
      console.log(`La carpeta ${dir} ha sido eliminada.`);
    } else {
      console.log(`La carpeta ${dir} no existe.`);
    }
  });
};

// Función para eliminar exportaciones que comienzan con './new/'
const removeNewExports = (filePath) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error al leer el archivo ${filePath}:`, err);
      return;
    }

    // Filtra las líneas que no comienzan con './new/'
    const filteredLines = data
      .split('\n')
      .filter((line) => !line.includes('./new/'));

    const newContent = filteredLines.join('\n');

    fs.writeFile(filePath, newContent, 'utf8', (err) => {
      if (err) {
        console.error(`Error al escribir el archivo ${filePath}:`, err);
        return;
      }
      console.log(
        `Las exportaciones que comienzan con "new" han sido eliminadas de ${filePath}.`,
      );
    });
  });
};

deleteDirectories(directoriesToDelete);
filesToModify.forEach(removeNewExports);
