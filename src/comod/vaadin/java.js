/**
 *  Exporter from model to Flow. Exports full project buildable with maven.
 */
import { flowImports } from "./flow_imports";

const kebabToPascalCase = (str) => {
  const parts = str.split("-");
  let result = "";
  for (const i in parts) {
    result = result.concat(parts[i][0].toUpperCase() + parts[i].slice(1));
  }
  return result;
};

const kebabToCamelCase = (str) => {
  const pascal = kebabToPascalCase(str).replace("/Vaadin/g", "");
  return pascal.charAt(0).toLowerCase() + pascal.substring(1);
};

export const packageToFolder = (packageName) => {
  return "src/main/java/" + packageName.replace(/\./g, "/") + "/";
};

const classForTag = (tag) => {
  return flowImports[tag] ? flowImports[tag].name : kebabToPascalCase(tag);
};

export const modelToJava = (code) => {
  const singleIndent = "    ";
  const doubleIndent = singleIndent + singleIndent;
  const importedTags = new Set();
  const stack = [];
  const variableStack = [];
  const varNames = {};

  let currentTag = "";
  let currentVar = "root";
  let currentVarDefinition = "";

  importedTags.add("div");

  let result = "";
  code.forEach((str) => {
    const trimmed = str.trim();
    switch (trimmed) {
      case "(": {
        currentTag = stack.pop();
        const elementClass = classForTag(currentTag);

        const varName = kebabToCamelCase(elementClass);
        let varCount = varNames[varName] || 0;
        varCount++;
        varNames[varName] = varCount;
        const newVar = varName + (varCount === 1 ? "" : varCount);

        if (currentTag === "leiskator-grid") {
          gridHadEntity = false;
          currentVarDefinition = `${elementClass}<GridTypePlaceholder> ${newVar}`;
          result +=
            `${doubleIndent}${currentVarDefinition} = new ${elementClass}<>();\n` +
            `${doubleIndent}${currentVar}.appendChild(${newVar});\n`;
        } else {
          currentVarDefinition = `Element ${newVar}`;
          result +=
            `${doubleIndent}${currentVarDefinition} = new Element("${currentTag}");\n` +
            `${doubleIndent}${currentVar}.appendChild(${newVar});\n`;
        }
        variableStack.push(currentVar);
        currentVar = newVar;

        if (currentTag in flowImports) {
          importedTags.add(currentTag);
        }
        break;
      }
      case ")":
        currentVar = variableStack.pop();
        break;
      case "=": {
        const tos = stack.pop();
        const nos = stack.pop();
        if (!nos || !tos) {
          return;
        }

        if (nos === "__variableName") {
          result = result + `${doubleIndent}${tos} = ${currentVar};\n`;
        } else if (nos === "textContent") {
          result = result.concat(
            `${doubleIndent}${currentVar}.setText("${tos.replace(
              /"/g,
              '\\"'
            )}");\n`
          );
        } else {
          result = result.concat(
            `${doubleIndent}${currentVar}.setAttribute("${nos}","${tos}");\n`
          );
        }

        break;
      }
      default:
        stack.push(trimmed);
    }
  });

  const importStrings = Array.from(importedTags).map(
    (tag) => flowImports[tag].import
  );

  return { code: result, importStrings };
};
