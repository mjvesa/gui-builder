import "@vaadin/accordion/vaadin-accordion.js";
import "@vaadin/notification/vaadin-notification.js";
import "@vaadin/checkbox/vaadin-checkbox.js";
import "@vaadin/checkbox/vaadin-checkbox-group.js";
import "@vaadin/button/vaadin-button.js";
import "@vaadin/overlay/vaadin-overlay.js";
import "@vaadin/date-picker/vaadin-date-picker.js";
import "@vaadin/split-layout/vaadin-split-layout.js";
import "@vaadin/progress-bar/vaadin-progress-bar.js";
import "@vaadin/combo-box/vaadin-combo-box.js";
import "@vaadin/custom-field/vaadin-custom-field.js";
import "@vaadin/text-field/vaadin-text-field.js";
import "@vaadin/text-field/vaadin-number-field.js";
import "@vaadin/text-field/vaadin-email-field.js";
import "@vaadin/time-picker/vaadin-time-picker.js";
import "@vaadin/text-field/vaadin-password-field.js";
import "@vaadin/text-field/vaadin-text-area.js";
import "@vaadin/context-menu/vaadin-context-menu.js";
import "@vaadin/tabs/vaadin-tabs.js";
import "@vaadin/tabs/vaadin-tab.js";
import "@vaadin/item/vaadin-item.js";
import "@vaadin/ordered-layout/vaadin-horizontal-layout.js";
import "@vaadin/ordered-layout/vaadin-vertical-layout.js";
import "@vaadin/form-layout/vaadin-form-layout.js";
import "@vaadin/form-layout/vaadin-form-item.js";
import "@vaadin/list-box/vaadin-list-box.js";
import "@vaadin/select/src/vaadin-select.js";
import "@vaadin/upload/vaadin-upload.js";
import "@vaadin/dialog/vaadin-dialog.js";
import "@vaadin/radio-button/vaadin-radio-group.js";
import "@vaadin/radio-button/vaadin-radio-button.js";
import "@vaadin/icons/vaadin-icons.js";
import "@vaadin/icons/vaadin-iconset.js";
import "@vaadin/icon/vaadin-icon.js";
import "@vaadin/virtual-list/vaadin-virtual-list.js";

import { typography } from "@vaadin/vaadin-lumo-styles/typography.js";
import { color } from "@vaadin/vaadin-lumo-styles/color.js";
import { spacing } from "@vaadin/vaadin-lumo-styles/spacing.js";
import { badge } from "@vaadin/vaadin-lumo-styles/badge.js";
import { utility } from "@vaadin/vaadin-lumo-styles/utility.js";

const toCSS = (thing) => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(thing.cssText);
  return sheet;
};

document.adoptedStyleSheets = [typography, color, spacing, badge, utility].map(
  toCSS
);

// const template = document.createElement("template");
// template.innerHTML =
//   '<custom-style><style include="lumo-utility lumo-color lumo-typography lumo-badge"></style></custom-style>';
// document.head.appendChild(template.content);

// window.ShadyCSS.CustomStyleInterface.processStyles();

import { flowImports } from "./flow_imports";

import { paletteContent } from "./palette";
import { vaadinComponentImports } from "./component_imports";
import { modelToJava } from "./java";
import { init, h, attributesModule, datasetModule } from "snabbdom";

const patch = init([attributesModule, datasetModule]);

const components = {};

const HTMLToATIR = (html, ignoreHead = false) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const atir = [];

  const parseTree = (parent) => {
    for (let el of parent.childNodes) {
      if (el.nodeType === 3) {
        if (/\S/.test(el.textContent)) {
          atir.push("textContent");
          atir.push(el.textContent);
          atir.push("=");
        }
      } else {
        atir.push(el.tagName.toLowerCase());
        atir.push("(");
        const attributes = el.attributes;
        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes.item(i);
          atir.push(attr.name);
          atir.push(attr.value);
          atir.push("=");
        }

        if (el.children) {
          parseTree(el);
        }
        atir.push(")");
      }
    }
  };
  if (!ignoreHead) {
    parseTree(document.head);
  }
  parseTree(document.body);
  console.log("THE MODEL: " + JSON.stringify(atir));
  return atir;
};

const javaToAtir = (code) => {
  const index = code.indexOf(JAVA_TEMPLATE_BEGIN);
  const index2 = code.indexOf(JAVA_TEMPLATE_END, index);
  const javaTemplate = code.slice(code.indexOf("\n", index), index2);
  const typelessJavaTemplate = javaTemplate
    .replace(/^\s*([A-Z]\S*)/gm, "let")
    .replace(/this/g, "thizz")
    .replace(
      /([a-zA-Z][a-zA-Z0-9]*)\s*=\s*([a-zA-Z][a-zA-Z0-9]*)\s*;/g,
      (a, b, c) => {
        return `${c}.setAttribute("__variableName","${b}")`;
      }
    );

  console.log(typelessJavaTemplate);
  let result = [];
  let isFirst = true;
  const elStack = [];
  const createStack = [];

  const fullCode = `
  const Element = function (tag) {
    const setPropAttr = (key, value) => {
      result.push(key);
      result.push(value);
      result.push("=");
    };

      createStack.push(tag);
      console.log("created new " + tag);
      elStack.push(this);
      this.appendChild = (el) => {
        console.log(tag + " : " + elStack);
        // If this is not the second last element, then remove elements until this one is left and add back the new one
        if (elStack[elStack.length - 2] !== this) {
          const latest = elStack.pop();
          while (elStack.pop() !== this) {
            result.push(")");
          }
          elStack.push(this);
          elStack.push(latest);
        }
        result.push(createStack.pop());
        result.push("(");
      };
      this.setAttribute = setPropAttr;
      this.setText =  (value) => {
        result.push("textContent");
        result.push(value);
        result.push("=");
      };

      this.toString = () => {
        return tag;
      };
  };
  ${typelessJavaTemplate}
`;

  const root = {
    appendChild: () => {
      if (elStack[elStack.length - 2] !== root) {
        const latest = elStack.pop();
        while (elStack.pop() !== root) {
          result.push(")");
        }
        elStack.push(root);
        elStack.push(latest);
      } else if (!isFirst) {
        result.push(")");
      }

      isFirst = false;
      result.push(createStack.pop());
      result.push("(");
    },
  };
  elStack.push(root);
  eval(fullCode);
  elStack.pop();
  elStack.forEach((el) => {
    result.push(")");
  });
  console.log(JSON.stringify(result));
  return result;
};

const isWebComponent = (content) => {
  return (
    content.includes("@customElement") ||
    content.includes("customElements.define")
  );
};

const isReactComponent = (content) => {
  return content.includes("react-vaadin-components");
};

const JAVA_TEMPLATE_BEGIN = "// GUI CONSTRUCTION BEGIN";
const JAVA_TEMPLATE_END = "// GUI CONSTRUCTION END";

const isJavaComponent = (content) => {
  return (
    content.includes(JAVA_TEMPLATE_BEGIN) && content.includes(JAVA_TEMPLATE_END)
  );
};

const ATIRToXML = (atir) => {
  let stack = [];
  let tagTree = [];
  let tags = new Set();

  let currentTag = "";
  let currentClosed = true;
  let hasTextContent = false;
  let textContent = "";

  let result = "";
  atir.forEach((str) => {
    let trimmed = str.trim();
    switch (trimmed) {
      case "(": {
        if (!currentClosed) {
          result = result.concat(`>${hasTextContent ? textContent : ""}`);
          currentClosed = true;
        }
        tagTree.push(currentTag);
        currentTag = stack.pop();
        tags.add(currentTag);

        result = result.concat("<" + currentTag);
        hasTextContent = false;
        currentClosed = false;
        break;
      }
      case ")": {
        if (!currentClosed) {
          result = result.concat(`>${hasTextContent ? textContent : ""}`);
          currentClosed = true;
        }
        result = result.concat(`</${currentTag}>\n`);
        currentTag = tagTree.pop();
        break;
      }
      case "=": {
        let tos = stack.pop();
        let nos = stack.pop();
        if (!nos || !tos || nos.startsWith("data-temp-")) {
          return;
        }
        if (nos === "textContent") {
          hasTextContent = true;
          textContent = tos;
        } else {
          result = result.concat(` ${nos}="${tos.replace(/\"/g, "&quot;")}"`);
        }
        break;
      }
      default:
        stack.push(trimmed);
    }
  });
  return { html: result, tags };
};

const modelToDOM = (code, inert = false) => {
  const stack = [];
  const tree = [];
  let current = { tag: "div", attributes: {}, dataset: {}, children: [] };
  code.forEach((str, index) => {
    const trimmed = str.trim();
    switch (trimmed) {
      case "(": {
        const tag = stack.pop();
        // Nested designs, attach shadow root, append style and content
        if (tag in components) {
          //const style = document.createElement("style");
          //style.textContent = storedDesigns.designs[tag].css;
          //current.shadowRoot.appendChild(style);
          tree.push(current);
          current = {
            tag: "div",
            attributes: { draggable: "true" },
            dataset: { nodeId: index },
            children: [modelToDOM(components[tag].tree, true)],
          };
        } else {
          tree.push(current);
          current = { tag, attributes: {}, dataset: {}, children: [] };
        }
        if (!inert) {
          current.dataset["nodeId"] = index;
          current.attributes["draggable"] = "true";
        }
        break;
      }
      case ")": {
        const vnode = h(
          current.tag,
          { attrs: current.attributes, dataset: current.dataset },
          current.children
        );
        current = tree.pop();
        current.children.push(vnode);
        break;
      }
      case "=": {
        const tos = stack.pop();
        const nos = stack.pop().replace("data-temp-", ""); // for live mode
        if (!nos.startsWith("@")) {
          if (nos === "textContent") {
            current.children.push(tos);
          } else {
            current.attributes[nos] = tos;
          }
        }
        break;
      }
      default: {
        stack.push(trimmed);
      }
    }
  });
  return h(
    current.tag,
    { attrs: current.attributes, dataset: current.dataset },
    current.children
  );
};

const updateComponent = (tag, tree, src) => {
  if (isJavaComponent(src)) {
    const { code: javaCode, importStrings } = modelToJava(tree);
    const startIndex = src.indexOf("\n", src.indexOf(JAVA_TEMPLATE_BEGIN));
    const endIndex = src.indexOf(JAVA_TEMPLATE_END);
    const updatedJavaCode =
      src.slice(0, startIndex + 1) + javaCode + src.slice(endIndex - 1);

    // 1. Split at first semicolon, if trimmed string starts with package, then store that as package declaration
    // 2. for each importString, check if it is found in the file. If not, add import statement to the top

    const firstSemicolonIndex = updatedJavaCode.indexOf(";");
    let packageDecl = updatedJavaCode.slice(0, firstSemicolonIndex + 1);
    packageDecl = packageDecl.trim().startsWith("package") ? packageDecl : "";
    let rest = updatedJavaCode.slice(
      firstSemicolonIndex + 1,
      updatedJavaCode.length
    );

    let importBlock = "";
    for (const importString of importStrings) {
      if (!rest.includes(importString)) {
        importBlock = `${importBlock}\n${importString}`;
      }
    }

    return packageDecl + "\n" + importBlock + "\n" + rest;
  } else if (isWebComponent(src)) {
    const { html, tags } = ATIRToXML(tree);
    for (const componentTag of tags) {
      if (componentTag in vaadinComponentImports) {
        for (const importDecl of vaadinComponentImports[componentTag]) {
          const singleQuote = importDecl.replace(/"/g, "'");
          if (!(src.includes(importDecl) || src.includes(singleQuote))) {
            src = importDecl + ";\n" + src;
          }
        }
      } else if (componentTag in components) {
        const currentPath = components[tag].path.split("/");
        const componentPath = components[componentTag].path.split("/");
        let commonIndex = 0;
        for (
          ;
          componentPath[commonIndex] === currentPath[commonIndex] &&
          commonIndex < componentPath.length;
          commonIndex++
        ) {}
        const backtrackCount = currentPath.length - commonIndex - 1;
        const path = new Array(backtrackCount)
          .fill("..")
          .concat(componentPath.slice(commonIndex))
          .join("/");
        const importDecl = `import "${path.replace(".ts", "")}"`;
        if (!src.includes(importDecl)) {
          src = importDecl + ";\n" + src;
        }
      }
    }

    return src.replace(/html`([\s\S]*?)`;/, "html`" + html + "`;");
  }
};

const parseComponent = (tag, content, path) => {
  if (isWebComponent(content)) {
    const htmlContent = content.match(/html`([\s\S]*?)`;/)[1];
    const tree = HTMLToATIR(htmlContent);
    components[tag] = { tree, path };
    return tree;
  } else if (isJavaComponent(content)) {
    const tree = javaToAtir(content);
    components[tag] = { tree, path };
    return tree;
  }
  return "";
};

let initialRender = true;
let oldvnode;
const render = (tag, tree, target) => {
  components[tag] = { ...components[tag], tree };
  const vnode = modelToDOM(tree);
  if (initialRender) {
    patch(target, vnode);
    initialRender = false;
  } else {
    patch(oldvnode, vnode);
  }
  oldvnode = vnode;
};

export const Comod = {
  palette: paletteContent,
  fileExtensions: ["ts", "java", "js"],
  parse: parseComponent,
  update: updateComponent,
  render: render,
};

window.Comod = Comod;
console.log("### bundle loaded ###");

console.log(document.styleSheets);
