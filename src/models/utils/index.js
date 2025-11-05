const { basename, extname } = require('path');
const { globSync } = require('glob');

const appModelsFiles = globSync('./src/models/appModels/**/*.js');

const pattern = './src/models/**/*.js';

const modelsFiles = globSync(pattern).map((filePath) => {
  const fileNameWithExtension = basename(filePath);
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  );
  return fileNameWithoutExtension;
});

const controllersList = [];
const appModelsList = [];
const entityList = [];
const routesList = [];

for (const filePath of appModelsFiles) {
  const fileNameWithExtension = basename(filePath);
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  );
  const firstChar = fileNameWithoutExtension.charAt(0);
  const modelName = fileNameWithoutExtension.replace(firstChar, firstChar.toUpperCase());
  const fileNameLowerCaseFirstChar = fileNameWithoutExtension.replace(
    firstChar,
    firstChar.toLowerCase()
  );
  const entity = fileNameWithoutExtension.toLowerCase();

  const controllerName = fileNameLowerCaseFirstChar + 'Controller';
  controllersList.push(controllerName);
  appModelsList.push(modelName);
  entityList.push(entity);

  const route = {
    entity: entity,
    modelName: modelName,
    controllerName: controllerName,
  };
  routesList.push(route);
}

const modelNames = globSync('./src/models/**/*.js').map((filePath) => {
  const fileNameWithExtension = basename(filePath);
  const modelName = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  );
  return modelName;
});

// Export modelsFiles for backward compatibility
module.exports = {
  controllersList,
  appModelsList,
  modelsFiles: modelNames,
  modelNames,
  entityList,
  routesList
};
