const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

let workspacePath = "";

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.leiskator",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "leiskatorView",
        "leiskator",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      const onDiskPath = vscode.Uri.file(
        path.join(context.extensionPath, "public")
      );

      const folder = panel.webview.asWebviewUri(onDiskPath);

      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "saveFile": {
              const fileName = workspacePath + "/" + message.fileName;
              const content = message.content;
              const directory = fileName.substring(
                0,
                fileName.lastIndexOf("/")
              );
              if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
              }
              fs.writeFileSync(fileName, content);
              return;
            }
            case "saveState": {
              const state = message.state;
              if (
                !fs.existsSync(workspacePath + "/" + "./src/main/resources")
              ) {
                fs.mkdirSyncworkspacePath +
                  "/" +
                  ("./src/main/resources", { recursive: true });
              }
              fs.writeFileSync(
                workspacePath +
                  "/" +
                  "./src/main/resources/leiskator_state.json",
                state
              );
              return;
            }
            case "doesFileExist": {
              const fileName = workspacePath + "/" + message.fileName;
              if (!fs.existsSync(fileName)) {
                panel.webview.postMessage({ command: "fileDoesNotExist" });
              }
              return;
            }
          }
        },
        undefined,
        context.subscriptions
      );

      const folders = vscode.workspace.workspaceFolders;
      for (let folder of folders) {
        if (
          fs.existsSync(
            folder.uri.path + "/src/main/resources/leiskator_state.json"
          )
        ) {
          workspacePath = folder.uri.path;
          break;
        }
      }
      let state = '{"designs": {} }';
      const statePath =
        workspacePath + "/src/main/resources/leiskator_state.json";
      vscode.workspace.openTextDocument(statePath).then((textFile) => {
        const state = textFile.getText();
        panel.webview.html = getHTML(folder, state);
      });
    }
  );

  context.subscriptions.push(disposable);
}

const getHTML = (folder, state) => {
  return `
	<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>leiskator</title>
  <link rel="manifest" href="./manifest.json">
  <link rel="icon" type="image/png" href="images/leiskator.png" sizes="256x256">
  <link rel="stylesheet" href="${folder}/bundle.css">
  
  <style>
  html {
    width: 100vw;
    height: 100vh;
  }

  body {
    width: 100vw;
    height: 100vh;
    margin: 0px;
    background-color: #222;
    color: white;
    overflow: hidden;
  }


  #design-details {
    height: 1.5rem;
    display: inline-block;
  }
  #container {
    display: grid;
    grid-template-columns: 15vw auto 15vw 15vw;
    width: 100vw;
    height: calc(100% - 1.5rem);
  }

  #paper {
    display:flex;
    flex-direction: column;
    justify-content: space-evenly;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: white;
    color:black;
  }

  #visual-editor {
    min-height: 50%;
    overflow: auto;
    flex-grow: 1;
    flex-shrink: 0;
  }

  #xml-editor {
    display: none;
    height: 50%;
    flex-grow: 1;
    flex-shrink: 0;
  }

  #palette-wrapper {
    height: 100%;
    overflow-y: auto;
  }
  #palette {
    height: 100%;
    overflow-y: visible;
    padding: 1em;
    border-right: 1px solid gray;
    border-top: 1px solid gray;
  }

  #outline {
    width: 100%;
    height: 50%;
    width: 15vw;
    border-top: 1px solid gray;
    overflow: auto;
  }


  #outline-attributes {
    overflow: hidden;
  }

  #outline div {
    margin-left: 1em;
  }

  #outline input {
    display: block;
    background-color: #222;
    border: none;
    color: white;
  }

  #outline input:focus {
    outline: none;
  }

  #attribute-panel {
    border-top: 1px solid gray;
    height: 50%;
    width: 100%;
  }
  
  #attributes {
    width: 100%;
    height: 100%;
    border: none;
    width: 15vw;
    background-color: #222;
    color: white;
    border-top: 1px solid gray;
    overflow: auto;
  }

  #attributes td {
    border: 1px solid gray;  
    word-wrap: break-word;
    width: 50%;
    max-width:50%;
  }

  #attributes > table {
    max-width: 100%;
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }


  #marker {
    display: none;
    position: absolute;
    border: 1px solid red;
    z-index: 20000;
  }

  #select-marker-outline, #select-marker-paper {
    display: none;
    position: absolute;
    border: 1px solid green;
    z-index: 10000;
    pointer-events: none;
  }

  #element-preview {
    display: none;
    position: absolute;
    background-color: #aad;
    border: 1px solid black;
    z-index: 10000;
    padding: 1em;
  }

  .palette-section {
      color: #aaa;
      transition: all 300ms ease-in-out; 
  }
  .palette-section:hover {
      color: white;
  }

  #editor-panel {
    height: 100%;
    overflow: hidden;
  }
  #text-editor {
    height: 50%;
  }
  
  #css-rule-filter {
    width: 100%;
    height: 1rem;
  }

  #css-rules {
    display: block;
    height: calc(50% - 1rem);
    overflow: auto;
  }
  .CodeMirror { height: 100%; }

  #delete-design {
    background-color: salmon;
  }

  </style>
</head>
<body>
  <!-- Various markes and overlays -->
  <div id="marker"></div>
  <div id="select-marker-outline"></div>
  <div id="select-marker-paper"></div>
  <div id="element-preview"></div>

  <!-- Settings page template -->
  <template id="settings-template">
    <style>
      .settings-page {
        display: flex;
        box-sizing:border-box;
        height: 100%;
        padding: 1rem;
        flex-direction: column;
        align-items: stretch;
        justify-content: space-between;
      }

      .button-bar {
        display: flex;
        justify-content: space-between;
      }
      #target-folder {
        width: 40rem;
      }

    </style>
    <div class="settings-page">
      <div>
        <span>
          Target package
          <input id="target-folder" type="text"></input>
          <!-- Button only visible on Electron -->
          <button  id="select-folder" hidden>Select</button>      
        </span>
        <span>
          Project format
          <select id="choose-export-format">
            <option>Vaadin Java</option>
            <option>Vaadin TypeScript</option>
            <option>LitElement</option>
            <option>VanillaJS</option>
            <option disabled>--------</option>            
            <option>Angular</option>
            <option>Preact</option>
            <option>React</option>
            <option>Svelte</option>
            <option>Vue</option>
            <option disabled>--------</option>            
            <option>Raw</option>
          </select>
        </span>
      </div>
      <span class="button-bar">
          <button id="settings-cancel">Cancel</button>
          <button id="settings-save">Save</button>
      </span>
  </div>
  </template>

  <!-- Header fields and buttons-->
  <div id="design-details">
    <span>leiskator 0.4.0</span>
    <button id="project-settings">Settings</button>
    <button id="new-design">New Design</button>
    <button id="sketch-design">Sketch</button>
    <button id="html-mode">XML</button>
    <span>
      Name:
      <input id="design-name" type="text"></input>
      <button id="save-design">Save</button>
    </span>
    <span>
      Load:
      <select id="choose-design"></select>
    </span>
    <button id="export-design">Export</button>
    <span>
      Import:
      <input type="file" id="import-file-input"></input>
      <button id="import-file">Import Raw</button>
    </span>
    <button id="share-designs">Share</button>
    <button id="delete-design">Delete design</button>

  </div>

  <!-- Designer UI panels-->
  <div id="container">
    <div id="editor-panel">
      <div id="text-editor"></div>
      <input id="css-rule-filter" type="text"></input>
      <div id="css-rules"></div>
    </div>
    <div id="paper">
        <div id="visual-editor">
          
        </div>
        <div id="xml-editor">
          
        </div>
  
    </div>
    <div id="palette-wrapper">
        <div id="palette">&nbsp;</div>
    </div>
    <div id="outline-attributes">
      <div id="outline">outline</div>
      <div id="attribute-panel"> 
        <table>
          <tr><td>Route</td><td><select id="target-route"></select></td></tr>
          <tr><td>Field</td><td><input id="field-name" type="text"></input></td></tr>
        </table>
        <div id="attributes"></div>
      </div>
    </div>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    window.leiskator = {};
    window.leiskator.inVSCode = true;
    window.leiskator.state = "${Buffer.from(state).toString("base64")}";

    window.leiskator.saveFile = (fileName, content) => {
      vscode.postMessage({command:"saveFile", fileName: fileName, content: content});
    };
       
    window.leiskator.saveState = state => {
      vscode.postMessage({command: "saveState", state:state});
    };

    let doesNotExistCallback;

    window.leiskator.ifDoesNotExist = (fileName, callback) => {
      doesNotExistCallback = callback;
      vscode.postMessage({command: "doesFileExist", fileName: fileName});
    }

    window.addEventListener('message', event => {
       const message = event.data;
        switch (message.command) {
            case 'fileDoesNotExist':
              if (doesNotExistCallback) {
                doesNotExistCallback();
              }
              break;
        }
    });
    
  </script>
  <script src="${folder}/lib/jszip.min.js"></script>
  <script src="${folder}/lib/jszip-utils.min.js"></script>

  <script src="${folder}/bundle.js"></script>


  </body>
</html>
	
  `;
};

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
