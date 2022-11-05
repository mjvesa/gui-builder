const fs = require("fs");
const { contextBridge } = require("electron");

const isWebComponent = (fileName) => {
  const content = fs.readFileSync(fileName);
  return content.includes("@customElement");
};

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

contextBridge.exposeInMainWorld("Leiskator", {
  fileAPIInstalled: true,

  saveFile: (fileName, content) => {
    const directory = fileName.substring(0, fileName.lastIndexOf("/"));
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(fileName, content);
  },

  loadFile: (path) => {
    return fs.readFileSync(path, "utf8");
  },

  parseComponents: (extensionsFn, parseFn) => {
    extensionsFn((extensions) => {
      console.log("extensions: " + JSON.stringify(extensions));
      const scanPalette = (dirName) => {
        try {
          files = fs.readdirSync(dirName, { withFileTypes: true });
          for (let file of files) {
            if (file.isDirectory()) {
              if (file.name !== "node_modules") {
                scanPalette(dirName + "/" + file.name);
              }
            } else {
              const extension = file.name.slice(file.name.lastIndexOf(".") + 1);
              console.log("extension: " + extension);
              if (extensions.includes(extension)) {
                const fullPath = dirName + "/" + file.name;
                console.log("found thing " + fullPath);
                const content = fs.readFileSync(fullPath, "utf8");
                parseFn({
                  content,
                  fileInfo: {
                    tag: file.name.replace("." + extension, ""),
                    css: "",
                    path: fullPath,
                    type: extension,
                  },
                });
              }
            }
          }
        } catch (ex) {
          console.log(ex);
        }
      };
      scanPalette("./");
    });
  },
});
