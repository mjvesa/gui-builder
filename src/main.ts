// with y0bi, the pain never ends...
import CodeMirror from "codemirror";
import "codemirror/mode/css/css.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/css-hint.js";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/tomorrow-night-eighties.css";

import { checkModel } from "./check-model";
import Picker from "vanilla-picker";
import * as Model from "./model";
import { cssPropertyTypes } from "./css-proprety-types";
import { cssProperties } from "./css-properties.js";
import { enterSketchMode } from "./sketch-mode";
import { ATIRToXML, XMLToATIR } from "./xml";
import { generateCrudFromBean } from "./crud_generator.js";

import {
  ECAPI,
  designComponentEditors as customEditors,
} from "./custom-editors.js";

import { querySelectorAllDeep } from "query-selector-shadow-dom";

import { HTMLToATIR, PatchAtirProps } from "./atir";

import {
  init,
  h,
  attributesModule,
  datasetModule,
  eventListenersModule,
  propsModule,
} from "snabbdom";

const patch = init([
  attributesModule,
  propsModule,
  eventListenersModule,
  datasetModule,
]);

// Global variables
const $ = document.querySelector.bind(document);

interface FileAPI {
  fileAPIInstalled: boolean;
  saveFile: (fileName: string, content: string) => void;
  loadFile: (path: string) => Promise<string>;
  parseComponents: (
    extensionsFn: (fn: () => string[]) => void,
    parseFn: (contentAndInfo) => void
  ) => void;
}

interface Component {
  tag: string;
  tree: string[];
  css: string;
  path: string;
}

interface State {
  currentComponent: Component | undefined;
}

const state: State = {
  currentComponent: undefined,
};

let selectedElement;

let storedComponents = { components: {} };

// DnD Stuff
let previousBegin, previousEnd;
let dndPayload;

interface HoverInfo {
  position: number;
  id: string;
}

let hoverInfo: HoverInfo | undefined;

// Component stack for undo/redo
let componentStack = [];
let redoStack = [];

let textEditor;
let htmlEditor;
let currentMode = "Visual";
let liveMode = false;
let liveModeTargetElement;
let liveModeTargetDocument;

// iframe callback stuff
let messageTokenCounter = 0;
const callbacks = {};

const getPaperElement = () => {
  const el = document.getElementById("visual-editor");
  return el;
};

const getFileAPI: () => FileAPI = () => (window as any).GUIBuilder as FileAPI;

const getEditorTargetElement = () => {
  if (liveMode) {
    return liveModeTargetElement;
  } else {
    return getPaperElement().shadowRoot;
  }
};

const getEditorTargetDocument = () => {
  if (liveMode) {
    return liveModeTargetDocument;
  } else {
    return getPaperElement().shadowRoot;
  }
};

/**
 * Gets the coordinates of the target on the screen, even if it is in an iframe
 *
 */
const getBcr = (target: HTMLElement) => {
  if (!liveMode) {
    return target.getBoundingClientRect();
  }

  let currentNode = target;
  while (currentNode && currentNode !== document.body) {
    if (currentNode === liveModeTargetElement) {
      const bcr = target.getBoundingClientRect();
      const iframeBcr = getPaperElement().getBoundingClientRect();
      return {
        left: bcr.left + iframeBcr.left,
        top: bcr.top + iframeBcr.top,
        right: bcr.right + iframeBcr.left,
        bottom: bcr.bottom + iframeBcr.top,
        width: bcr.width,
        height: bcr.height,
      };
    }
    currentNode = currentNode.parentElement;
  }
  return target.getBoundingClientRect();
};

const getOutlineElement = () => {
  return document.querySelector("#outline-panel > div");
};

let renderingRequested = false;
const showCurrentComponent = () => {
  if (!renderingRequested) {
    window.requestAnimationFrame(showCurrentComponentImmediately);
    renderingRequested = true;
  }
};

let oldOutlineVNode;

const showCurrentComponentImmediately = () => {
  checkModel(state.currentComponent.tree);
  hideMarkers();
  comodMessage({ command: "render", ...state.currentComponent });
  /*const canvas = getEditorTargetElement();
  canvas.innerHTML = "";
  const style = document.createElement("style");
  style.textContent = currentComponent.css; //textEditor.getValue();
  textEditor.getDoc().setValue(currentComponent.css);
  $("#component-type").value = currentComponent.type;
  canvas.appendChild(style);
  modelToDOM(currentComponent.tree, canvas);*/

  const outline = getOutlineElement();
  const vnode = modelToOutline(state.currentComponent.tree);
  if (oldOutlineVNode) {
    patch(oldOutlineVNode, vnode);
  } else {
    patch(outline, vnode);
  }
  oldOutlineVNode = vnode;
  renderingRequested = false;
};

const startDrag = (event, snippet) => {
  console.trace("start drag");
  dndPayload = snippet;
  previousBegin = previousEnd = -1;
};

// eslint-disable-next-line
const startDragFromModel = (elementId) => {
  console.trace("start drag from model");
  previousBegin = elementId - 1;
  previousEnd = Model.findDanglingParen(
    state.currentComponent.tree,
    Number(elementId) + 1
  );
};

const showNewComponent = (newComponent) => {
  componentStack.push(state.currentComponent);
  state.currentComponent = newComponent;
  showCurrentComponent();
};

/**
 * Determines where on the target the current coordinates lie. Either
 * they are before the element, on the element or after the
 * element.
 *
 * @param {*} el
 * @param {*} clientX
 * @param {*} clientY
 */
const getPositionOnTarget = (left, top, width, height, clientX, clientY) => {
  const radius = Math.min(width, height) / 2;
  const midX = left + width / 2;
  const midY = top + height / 2;
  if (
    Math.sqrt(
      (midX - clientX) * (midX - clientX) + (midY - clientY) * (midY - clientY)
    ) <= radius
  ) {
    return Model.POSITION_CHILD_OF_ELEMENT;
  } else if (clientY < midY) {
    return Model.POSITION_BEFORE_ELEMENT;
  } else {
    return Model.POSITION_AFTER_ELEMENT;
  }
};

const getElementAt = (x, y, fn) => {
  const el = document.elementFromPoint(x, y);
  if (el && el.tagName === "IFRAME") {
    getElementFromCanvas(x, y, (coords) => {
      const element = {};
      if (coords.id !== "-1") {
        fn({
          x,
          y,
          id: coords.id,
          left: coords.left,
          top: coords.top,
          width: coords.width,
          height: coords.height,
        });
      }
    });
  } else {
    if (el) {
      const bcr = el.getBoundingClientRect();
      fn({
        x,
        y,
        id: el.getAttribute("data-node-id"),
        left: bcr.left,
        top: bcr.top,
        width: bcr.width,
        height: bcr.height,
      });
    }
  }
  fn({});
};

const hideMarkers = () => {
  $("#select-marker-outline").style.display = "none";
  $("#select-marker-paper").style.display = "none";
  $("#marker").style.display = "none";
};

const placeMarkerWithCoordinates = ({ x, y, id, left, top, width, height }) => {
  const marker = document.getElementById("marker");
  if (id) {
    marker.style.display = "block";
    marker.style.top = top + "px";
    marker.style.left = left + "px";
    marker.style.width = width + "px";
    marker.style.height = height + "px";
    const position = getPositionOnTarget(left, top, width, height, x, y);

    hoverInfo = { position, id };
    switch (position) {
      case Model.POSITION_CHILD_OF_ELEMENT:
        marker.style.border = "2px red solid";
        break;
      case Model.POSITION_BEFORE_ELEMENT:
        marker.style.border = "none";
        marker.style.borderTop = "2px red solid";
        marker.style.borderLeft = "2px red solid";
        break;
      case Model.POSITION_AFTER_ELEMENT:
        marker.style.border = "none";
        marker.style.borderBottom = "2px red solid";
        marker.style.borderRight = "2px red solid";
        break;
      default:
        break;
    }
  }
};

const placeMarker = (e) => {
  e.preventDefault();
  //e.stopPropagation();
  console.log("placing marker");
  const marker = document.getElementById("marker");
  getElementAt(e.clientX, e.clientY, placeMarkerWithCoordinates);
};

const insertingNewSubtree = () => {
  return previousBegin === previousEnd;
};

const dropElementWithData = (hoverInfo: HoverInfo) => {
  hideMarkers();
  // Find position of target
  const index = Number(hoverInfo.id);
  const position = hoverInfo.position;

  let newComponent;

  if (insertingNewSubtree()) {
    const subtree = dndPayload;
    newComponent = {
      ...state.currentComponent,
      tree: Model.insertSubtree(
        index,
        position,
        subtree,
        state.currentComponent.tree
      ),
    };
  } else {
    if (index >= previousBegin && index <= previousEnd) {
      // Do not allow dropping on itself
      return;
    }
    newComponent = {
      ...state.currentComponent,
      tree: Model.moveSubtree(
        index,
        position,
        previousBegin,
        previousEnd,
        state.currentComponent.tree
      ),
    };
  }

  componentStack.push(state.currentComponent);
  state.currentComponent = newComponent;
  showCurrentComponent();
};
const dropElement = (e) => {
  dropElementWithData(hoverInfo);
  e.preventDefault();
};

const placeSelectMarker = (bcr, marker) => {
  marker.style.display = "block";
  marker.style.top = bcr.top + "px";
  marker.style.left = bcr.left + "px";
  marker.style.width = bcr.width + "px";
  marker.style.height = bcr.height + "px";
};

const updatePropsTable = () => {
  // Mini interpreter for extracting property values
  const stack = [];
  let props = "";
  let ip = selectedElement + 1;
  let value = state.currentComponent.tree[ip].trim();
  const tag = state.currentComponent.tree[ip - 2].trim();
  while (
    value !== "(" &&
    value !== ")" &&
    ip < state.currentComponent.tree.length
  ) {
    if (value === "=") {
      const tos = stack.pop();
      const nos = stack.pop();
      props =
        props +
        `<tr><td contenteditable>${nos}</td><td contenteditable>${tos}</td></tr>`;
    } else {
      stack.push(value);
    }
    ip++;
    value = state.currentComponent.tree[ip].trim();
  }

  // Add ten lines for new props
  for (let i = 0; i < 10; i++) {
    props =
      props + `<tr><td contenteditable></td><td contenteditable></td></tr>`;
  }

  document.getElementById("props-table").innerHTML = props;
};

const selectElementWithId = (componentId) => {
  $("#attribute-panel-button").click();
  getElementCoordinatesFromCanvas(componentId, (coords) => {
    const iframeBcr = getPaperElement().getBoundingClientRect();
    coords.left = coords.left + iframeBcr.left;
    coords.top = coords.top + iframeBcr.top;
    placeSelectMarker(coords, document.getElementById("select-marker-paper"));
  });
  placeSelectMarker(
    getBcr($(`#outline-panel [data-node-id="${componentId}"]`)),
    document.getElementById("select-marker-outline")
  );
  selectedElement = Number(componentId);
  // Mini interpreter for extracting property values
  const stack = [];
  let ip = selectedElement + 1;
  const propsObj: Record<string, string> = {};
  const style: Record<string, string> = {};
  const tag = state.currentComponent.tree[ip - 2].trim();
  let props = "";
  let value = state.currentComponent.tree[ip].trim();

  while (
    value !== "(" &&
    value !== ")" &&
    ip < state.currentComponent.tree.length
  ) {
    if (value === "=") {
      const tos = stack.pop();
      const nos = stack.pop();

      if (nos === "style") {
        const rules = tos.split(";");
        for (let rule of rules) {
          const prop = rule.split(":");
          const name = prop[0];
          if (name !== "") {
            style[name] = prop[1];
          }
        }
      }
      propsObj[nos] = tos;
      props =
        props +
        `<tr><td contenteditable>${nos}</td><td contenteditable>${tos}</td></tr>`;
    } else {
      stack.push(value);
    }
    ip++;
    value = state.currentComponent.tree[ip].trim();
  }

  // Add ten lines for new props
  for (let i = 0; i < 10; i++) {
    props =
      props + `<tr><td contenteditable></td><td contenteditable></td></tr>`;
  }

  document.getElementById("props-table").innerHTML = props;

  const ceapi: ECAPI = {
    repaint: () => updateAttributesFromComponentEditor(ceapi),
    props: propsObj,
    style: style,
  };
  createEditorSelect(tag, ceapi);
};

/**
 * Selects the clicked element and displays its attributes in the
 * attribute panel.
 *
 * @param {*} e
 */
const selectElement = (e) => {
  console.log("selecting");
  const target = getElementAt(e.clientX, e.clientY, ({ id }) => {
    if (id) {
      selectElementWithId(id);
    }
  });
};

let editors = {};

const createEditorSelect = (tag, ECAPI) => {
  const editorSelect = $("#editor-select");
  editorSelect.oninput = (event) => {
    installBExpEditor(event.target.value, ECAPI);
  };
  editors = {};
  editorSelect.innerHTML = "";
  let installedEditor = false;
  customEditors.forEach((editor) => {
    if (editor[0] === "*" || editor[0] === tag) {
      const editorName = editor[1].name;
      editors[editorName] = editor[1].fn;
      const option = document.createElement("option");
      option.textContent = editor[1].displayname;
      option.value = editorName;
      editorSelect.appendChild(option);
      if (editorName == tag + "-editor") {
        installBExpEditor(editorName, ECAPI);
        editorSelect.value = editorName;
        installedEditor = true;
      }
    }
  });
  if (!installedEditor) {
    installBExpEditor("default-editor", ECAPI);
  }
};

const updateAttributesFromComponentEditor = (ECAPI) => {
  const { props, style } = ECAPI;
  const propsArr = [];
  let hadStyle = false;

  if (style) {
    let styleStr = "";
    for (const key of Object.keys(style)) {
      styleStr = styleStr + key + ":" + style[key] + ";";
    }
    if (styleStr.trim() !== "") {
      propsArr.push("style");
      propsArr.push(styleStr);
      propsArr.push("=");
      hadStyle = true;
    }
  }

  for (const key of Object.keys(props)) {
    if (!(key == "style" && hadStyle)) {
      propsArr.push(key);
      propsArr.push(props[key]);
      propsArr.push("=");
    }
  }

  const newComponent = {
    ...state.currentComponent,
    tree: Model.updateSubtreeAttributes(
      propsArr,
      selectedElement,
      state.currentComponent.tree
    ),
  };
  showNewComponent(newComponent);
  updatePropsTable();
};

const installBExpEditor = (editorName, ECAPI) => {
  editors[editorName]($("#custom-editor"), ECAPI);
};

/**
 * Updates the attributes of the selected element by removing
 * the previous ones and replacing them with new attributes.
 */
const updateAttributes = () => {
  let attributes = [];
  const rows = $("#props-table").childNodes[0].childNodes;
  rows.forEach((tr) => {
    let key = tr.firstChild.textContent;
    let value = tr.lastChild.textContent;
    console.log(key);
    console.log(value);
    if (!(key.trim() === "")) {
      attributes.push(key);
      attributes.push(value);
      attributes.push("=");
    }
  });

  console.log(JSON.stringify(attributes));

  const newComponent = {
    ...state.currentComponent,
    tree: Model.updateSubtreeAttributes(
      attributes,
      selectedElement,
      state.currentComponent.tree
    ),
  };
  showNewComponent(newComponent);
};

// eslint-disable-next-line
const navigateTo = (event) => {
  const targetRoute = event.target.getAttribute("targetroute");
  if (targetRoute) {
    loadComponent(targetRoute);
  }
};

const insertCssRule = (el) => {
  let selector = "";
  let current = el;
  const shadowParent = getPaperElement().shadowRoot;
  while (current && current != shadowParent) {
    if (current.className != "") {
      selector = `.${current.className} ${selector}`;
    } else {
      selector = `${current.tagName.toLowerCase()} ${selector}`;
    }
    current = current.parentElement;
  }
  textEditor.setCursor(textEditor.lineCount(), 0);
  insertCssAtCursor(`\n${selector.trim().replace(/ /g, " > ")} {\n\n}`);
  textEditor.setCursor(textEditor.lineCount() - 2, 0);
  textEditor.focus();
};

const modelToDOM = (code, target, inert = false) => {
  const stack = [];
  const tree = [];
  let current = target;
  // current = target;
  code.forEach((str, index) => {
    const trimmed = str.trim();
    switch (trimmed) {
      case "(": {
        const old = current;
        tree.push(current);
        const tag = stack.pop();
        // Nested components, attach shadow root, append style and content
        if (tag in storedComponents.components) {
          current = document.createElement("div");
          current.attachShadow({ mode: "open" });
          const style = document.createElement("style");
          style.textContent = storedComponents.components[tag].css;
          current.shadowRoot.appendChild(style);
          modelToDOM(
            storedComponents.components[tag].tree,
            current.shadowRoot,
            true
          );
        } else {
          current = document.createElement(tag);
        }
        if (!inert) {
          current.setAttribute("data-node-id", index);
          current.ondragstart = (event) => {
            startDragFromModel(index);
            event.stopPropagation();
          };
          current.ondblclick = (event) => {
            navigateTo(event);
          };

          current.oncontextmenu = (event) => {
            insertCssRule(event.target);
            event.stopPropagation();
            event.preventDefault();
          };
          current.draggable = true;
        }
        old.appendChild(current);
        break;
      }
      case ")": {
        current = tree.pop();
        break;
      }
      case "=": {
        if (current && current !== target) {
          const tos = stack.pop();
          const nos = stack.pop().replace("data-temp-", "");
          if (nos in current) {
            try {
              const json = JSON.parse(tos);
              current[nos] = json;
            } catch (e) {
              current[nos] = tos;
              current.setAttribute(nos, tos);
            }
          } else {
            current.setAttribute(nos, tos);
          }

          break;
        }
      }
      default: {
        stack.push(trimmed);
      }
    }
  });
  return current;
};

let skipOutline = false;
const modelToOutline = (code) => {
  let stack = [];
  let tree = [];
  let current = { attributes: {}, dataset: {}, on: {}, children: [] };
  if (!skipOutline) {
    code.forEach((str, index) => {
      const trimmed = str.trim();
      switch (trimmed) {
        case "(":
          tree.push(current);
          current = {
            attributes: {},
            dataset: { nodeId: index },
            on: {
              dragstart: (event) => {
                console.log("Starting drag");
                event.dataTransfer.setData("text/html", index + "");
                startDragFromModel(index);
                event.stopPropagation();
              },
            },
            children: [
              h(
                "div",
                {
                  dataset: { nodeId: index },
                  on: {
                    mouseenter: (event) => {
                      (event.target as HTMLElement).classList.add(
                        "highlighted"
                      );
                    },
                    mouseleave: (event) => {
                      (event.target as HTMLElement).classList.remove(
                        "highlighted"
                      );
                    },
                  },
                },
                [stack.pop()]
              ),
            ],
          };
          /*const input = document.createElement("input");
          input.oninput =;
          input.onfocus = (event) => {
            selectElementWithId(index);
          };
          input.onmouseenter =;
          input.onmouseleave = ;
*/
          current.dataset["nodeId"] = index;
          current.attributes["draggable"] = "true";
          current.attributes["open"] = true;

          break;
        case ")":
          const vnode = h(
            "div",
            {
              attrs: current.attributes,
              dataset: current.dataset,
              on: current.on,
            },
            current.children
          );
          current = tree.pop();
          current.children.push(vnode);
          break;
        case "=":
          stack.pop();
          stack.pop();
          break;
        default:
          stack.push(trimmed);
      }
    });
  }
  return h(
    "div",
    { attrs: current.attributes, dataset: current.dataset },
    current.children
  );
};

const createPaletteEntry = (useTag, tag, snippet) => {
  const el = document.createElement(useTag);
  if (snippet) {
    el.draggable = true;
    el.ondragstart = (event) => {
      const preview = document.getElementById("element-preview");
      preview.style.display = "none";
      startDrag(event, snippet);
    };

    el.onmouseenter = (event) => {
      const preview = document.getElementById("element-preview");
      preview.style.top = event.clientY + 50 + "px";
      preview.style.left = event.clientX + "px";
      preview.innerHTML = "";
      modelToDOM(snippet, preview);
      preview.style.display = "block";
      el.classList.add("highlighted");
    };
    el.onmouseleave = () => {
      const preview = document.getElementById("element-preview");
      preview.style.display = "none";
      el.classList.remove("highlighted");
    };
  }
  el.innerHTML = tag;
  return el;
};

/**
 * Creates a section in the palette. Features a title of
 * the section and contents that appears on hover.
 */
const createPaletteSection = (name, tags, palette) => {
  const outer = document.createElement("div");
  outer.className = "palette-section";
  outer.innerHTML = name;
  palette.appendChild(outer);
  for (const i in tags) {
    const tagAndSnippet = tags[i];
    outer.appendChild(
      createPaletteEntry("div", tagAndSnippet[0], tagAndSnippet[1])
    );
  }
};

/**
 * Loads palette content from Comod
 */
const populatePalette = () => {
  const palette = document.getElementById("guib-palette");
  getPaletteContent((paletteContent) => {
    for (const j in paletteContent) {
      const section = paletteContent[j];
      createPaletteSection(section[0], section[1], palette);
    }
  });
};

/**
 * Populates the component selector with the components found
 * in local storage.
 */
const populateComponentSelector = (selector) => {
  selector.innerHTML = "";
  const keys = Object.keys(storedComponents.components);
  for (const i in keys) {
    const el = document.createElement("option");
    el.textContent = keys[i];
    el.setAttribute("value", keys[i]);
    selector.add(el);
  }
};

const populateComponentSelectors = () => {
  populateComponentSelector($("#choose-component"));
};

/**
 * Saves the current component back into the file it came from
 *
 * @param {*} event
 */
const saveComponent = async () => {
  const componentName = (
    document.getElementById("choose-component") as HTMLInputElement
  ).value;
  storedComponents.components[componentName] = state.currentComponent;

  const currentSrc = await getFileAPI().loadFile(state.currentComponent.path);
  console.log("The current" + currentSrc);

  updateComponent(
    currentSrc,
    state.currentComponent,
    (updatedComponentSrc, updatedComponent) => {
      getFileAPI().saveFile(updatedComponent.path, updatedComponentSrc);
    }
  );
};

/**
 * Pulls the specified component from local storage and uses it as the
 * current component.
 *
 * @param {*} componentName
 */
const loadComponent = (componentName) => {
  hideMarkers();
  state.currentComponent = storedComponents.components[componentName];
  console.log(`Loading component ${JSON.stringify(state.currentComponent)}`);
  componentStack = [];
  redoStack = [];
  showCurrentComponent();
};

const loadSelectedComponent = () => {
  loadComponent(
    (document.getElementById("choose-component") as HTMLInputElement).value
  );
};

const switchToSketchMode = () => {
  hideMarkers();
  getPaperElement().style.display = "none";
  $("#xml-editor").style.display = "block";
  enterSketchMode($("#xml-editor"), (component) => {
    const newTree = state.currentComponent.tree.slice().concat(component);
    $("#xml-editor").style.display = "none";
    getPaperElement().style.display = "block";
    showNewComponent({ ...state.currentComponent, tree: newTree });
  });
};

const selectFirstComponent = () => {
  const keys = Object.keys(storedComponents.components);
  $("#choose-component").value = keys[0];
  loadComponent(keys[0]);
};

const newComponentFromBean = () => {
  const el = $("#visual-editor");
  const node = document.importNode($("#crudgen-template").content, true);
  el.shadowRoot.innerHTML = "";
  el.shadowRoot.appendChild(node);

  const button = el.shadowRoot.querySelector("#generate-crud-button");
  button.onclick = () => {
    const ta = el.shadowRoot.querySelector("#bean-source");
    const crud = generateCrudFromBean(ta.value);
    state.currentComponent = {
      tag: "bean-crud",
      css: "",
      tree: crud,
      path: "",
    };
    componentStack.push(state.currentComponent);
    showCurrentComponent();
  };
};

const toggleXMLMode = () => {
  const editorEl = $("#xml-editor");
  if (currentMode !== "XML") {
    currentMode = "XML";
    editorEl.style.display = "block";
    editorEl.innerHTML = "";
    // eslint-disable-next-line no-undef
    const ta = document.createElement("text-area");

    editorEl.appendChild(ta);
    htmlEditor = CodeMirror(ta, {
      mode: "text/xml",
      theme: "tomorrow-night-eighties",
      extraKeys: { "Ctrl-Space": "autocomplete" },
      lineNumbers: true,
    });
    htmlEditor.getDoc().setValue(ATIRToXML(state.currentComponent.tree));
    htmlEditor.on("change", () => {
      window.requestAnimationFrame(() => {
        const newComponent = {
          ...state.currentComponent,
          tree: XMLToATIR(htmlEditor.getDoc().getValue()),
        };
        showNewComponent(newComponent);
      });
    });
  } else {
    currentMode = "Visual";
    editorEl.style.display = "none";
  }
};

const toggleLiveMode = () => {
  liveMode = true;
  const appFrame = document.createElement("iframe");
  appFrame.style.width = "100%";
  appFrame.style.height = "100%";

  appFrame.onload = () => {
    let hoveredElement;
    let hoveredEntry;

    const style = document.createElement("style");
    style.textContent = ".v-system-error {visibility:hidden}";
    appFrame.contentDocument.body.appendChild(style);

    appFrame.contentDocument.onmousemove = (event) => {
      const marker = document.querySelector("#element-marker") as HTMLElement;
      let markerVisible = false;
      hoveredElement = undefined;
      if (event.ctrlKey) {
        const wrapperBcr = appFrame.getBoundingClientRect();
        const wrapX = wrapperBcr.left;
        const wrapY = wrapperBcr.top;
        const x = event.clientX;
        const y = event.clientY;
        let smallestArea = 10000000;

        let smallestBcr;
        let smallestEl;
        let smallestTag;

        for (let entry of getFileAPI().palette) {
          let elements = querySelectorAllDeep(
            entry.tag,
            appFrame.contentDocument
          );
          if (elements.length > 0) {
            for (let el of elements) {
              const bcr = el.getBoundingClientRect();

              if (
                x > bcr.left &&
                x < bcr.right &&
                y > bcr.top &&
                y < bcr.bottom
              ) {
                markerVisible = true;

                const area = bcr.width * bcr.height;
                if (area < smallestArea) {
                  smallestArea = area;
                  marker.style.left = wrapX + bcr.left + "px";
                  marker.style.top = wrapY + bcr.top + "px";
                  marker.style.width = bcr.width + "px";
                  marker.style.height = bcr.height + "px";
                  marker.textContent = entry.tag;
                  smallestBcr = bcr;
                  smallestEl = el;
                  smallestTag = entry.tag;
                  hoveredElement = el;
                  hoveredEntry = entry;
                }
              }
            }
          }
        }

        marker.textContent = smallestTag;
      }
      marker.style.display = markerVisible ? "block" : "none";
    };

    appFrame.contentDocument.onmouseup = (event) => {
      if (hoveredElement && event.ctrlKey) {
        liveModeTargetElement = hoveredElement.shadowRoot || hoveredElement;
        liveModeTargetDocument = appFrame.contentDocument;
        liveModeTargetElement.ondragover = placeMarker;
        liveModeTargetElement.ondrop = dropElement;
        liveModeTargetElement.onclick = selectElement;

        const componentName = hoveredEntry.tag;
        hideMarkers();
        // This might be enough, if it weren't for the patching...
        //$("#choose-component").value = componentName;
        const tree = HTMLToATIR(hoveredElement.innerHTML);
        const patchedTree = PatchAtirProps(
          storedComponents.components[componentName].tree,
          tree
        );

        state.currentComponent = {
          tag: hoveredEntry.tag,
          tree: patchedTree,
          css: "",
          path: storedComponents.components[componentName].path,
        };
        componentStack = [];
        redoStack = [];
        showCurrentComponent();

        // TODO
        // -identify different nodes with the same path
      }
    };
  };

  appFrame.setAttribute(
    "sandbox",
    "allow-same-origin allow-scripts allow-top-navigation"
  );
  appFrame.src = "http://localhost:8080";
  getPaperElement().shadowRoot.innerHTML = "";
  getPaperElement().shadowRoot.appendChild(appFrame);
};

const showPropsPanel = () => {
  //deselectTab("css-panel");
  selectTab("attribute-panel");
  deselectTab("palette-panel");
};

const showPalettePanel = () => {
  //deselectTab("css-panel");
  deselectTab("attribute-panel");
  selectTab("palette-panel");
};

const selectTab = (tab) => {
  $("#" + tab).style.display = "block";
  $("#" + tab + "-button").classList.add("active");
};

const deselectTab = (tab) => {
  $("#" + tab).style.display = "none";
  $("#" + tab + "-button").classList.remove("active");
};

const showCssPanel = () => {
  selectTab("css-panel");
  deselectTab("attribute-panel");
  deselectTab("palette-panel");
};

/**
 * Installs handlers for mouse events on various parts of the UI
 */
const installUIEventHandlers = () => {
  const outline = getOutlineElement() as HTMLElement;
  outline.ondragover = placeMarker;
  outline.onclick = selectElement;
  outline.ondrop = dropElement;
  document.body.ondragend = hideMarkers;
  const attributes = $("#props-table");
  attributes.oninput = updateAttributes;

  $("#save-component").onclick = saveComponent;
  $("#choose-component").onchange = loadSelectedComponent;
  $("#sketch-component").onclick = switchToSketchMode;
  $("#new-component-from-bean").onclick = newComponentFromBean;
  $("#html-mode").onclick = toggleXMLMode;
  $("#live-mode").onclick = toggleLiveMode;

  $("#attribute-panel-button").onclick = showPropsPanel;
  $("#palette-panel-button").onclick = showPalettePanel;
  //$("#css-panel-button").onclick = showCssPanel;

  //  $("#css-rule-filter").oninput = () => {
  //    setupCssRules($("#css-rule-filter").value);
  //};

  textEditor.on("change", () => {
    const el = paper.shadowRoot.querySelector("style");
    if (el) {
      const css = textEditor.getValue();
      el.textContent = css;
      state.currentComponent.css = css;
    }
  });

  let showingEditor = false;
  let lastLine = 0;

  textEditor.on("cursorActivity", () => {
    const el = document.getElementById("element-preview");
    const pos = textEditor.getCursor();
    let line = textEditor.getLine(pos.line);
    const pieces = line.split(":");
    const prop = pieces[0].trim();
    if (pieces.length > 1) {
      if (cssPropertyTypes.size.includes(prop)) {
        if (!showingEditor || lastLine !== pos.line) {
          showingEditor = true;
          lastLine = pos.line;
          el.innerHTML = '<input type="range" id="somerange"></input>';
          el.style.display = "block";
          el.style.top = pos.line + 4 + "rem";
          el.style.left = pos.ch + "rem";
          const rangeEl = document.getElementById("somerange");
          rangeEl.oninput = () => {
            line = textEditor.getLine(pos.line);
            const end = { line: pos.line, ch: line.length };
            const beginning = { line: pos.line, ch: 0 };
            let newContent;
            if (/[0-9]+/.test(line)) {
              newContent = line.replace(
                /[0-9]+/,
                (rangeEl as HTMLInputElement).value
              );
            } else {
              newContent = line.replace(
                /:[ ]*[0-9]*[ ]*;?/,
                ": " + (rangeEl as HTMLInputElement).value + "px;"
              );
            }
            textEditor.replaceRange(newContent, beginning, end);
          };
        }
      } else if (cssPropertyTypes.color.includes(prop)) {
        if (!showingEditor || lastLine !== pos.line) {
          showingEditor = true;
          lastLine = pos.line;
          el.innerHTML = '<div id="color-picker">Pick Color</div>';
          el.style.display = "block";
          el.style.top = pos.line + 4 + "rem";
          el.style.left = pos.ch + "rem";
          const parent = document.getElementById("color-picker");
          new Picker({
            parent: parent,
            color: pieces[1].replace(";", ""),
            onChange: (color) => {
              const newLine = textEditor.getLine(pos.line);
              const end = { line: pos.line, ch: newLine.length };
              const beginning = { line: pos.line, ch: 0 };
              const newContent = newLine.replace(
                /:[ ]*#*([a-z]|[0-9])*[ ]*;?/,
                ": " + color.hex + ";"
              );
              //"font-size:" + rangeEl.value + "px",
              textEditor.replaceRange(newContent, beginning, end);
            },
          });
        }
      } else if (cssPropertyTypes.finite.hasOwnProperty(prop)) {
        if (!showingEditor || lastLine !== pos.line) {
          const choices = cssPropertyTypes.finite[prop];
          showingEditor = true;
          lastLine = pos.line;
          el.innerHTML = '<select id="finite-select"></select>';
          el.style.display = "block";
          el.style.top = pos.line + 4 + "rem";
          el.style.left = pos.ch + "rem";
          const parent = document.getElementById("finite-select");
          choices.forEach((choice) => {
            const opt = document.createElement("option");
            opt.textContent = choice;
            parent.appendChild(opt);
          });

          parent.onchange = () => {
            const newLine = textEditor.getLine(pos.line);
            const end = { line: pos.line, ch: newLine.length };
            const beginning = { line: pos.line, ch: 0 };
            const newContent = newLine.replace(
              /:[ ]*#*([a-z]|-)*[ ]*;?/,
              ": " + (parent as HTMLInputElement).value + ";"
            );
            //"font-size:" + rangeEl.value + "px",
            textEditor.replaceRange(newContent, beginning, end);
          };
        }
      } else {
        showingEditor = false;
        lastLine = 0;
        el.style.display = "none";
      }
    } else {
      showingEditor = false;
      lastLine = 0;
      el.style.display = "none";
    }
  });
};

const installKeyboardHandlers = () => {
  document.body.oncopy = (event) => {
    console.log("COPY COPY COPY");
    event.clipboardData.setData(
      "text/plain",
      ATIRToXML(Model.copySubtree(selectedElement, state.currentComponent.tree))
    );
    event.preventDefault();
  };

  document.body.onpaste = (event) => {
    const html = event.clipboardData.getData("text/plain");
    console.log("Obtained html : " + html);
    const tree = XMLToATIR(html);
    console.log("Resulting tree: " + JSON.stringify(tree));
    const newComponent = {
      ...state.currentComponent,
      tree: Model.insertSubtree(
        selectedElement,
        Model.POSITION_AFTER_ELEMENT,
        tree,
        state.currentComponent.tree
      ),
    };
    showNewComponent(newComponent);

    event.preventDefault();
  };

  document.body.onkeydown = (event) => {
    if (event.key === "z" && event.ctrlKey) {
      if (componentStack.length > 0) {
        redoStack.push(state.currentComponent);
        state.currentComponent = componentStack.pop();
        showCurrentComponent();
      }
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.key === "y" && event.ctrlKey) {
      if (redoStack.length > 0) {
        componentStack.push(state.currentComponent);
        state.currentComponent = redoStack.pop();
        showCurrentComponent();
      }
      event.stopPropagation();
      event.preventDefault();
    }

    if (event.key === "Delete" && event.ctrlKey) {
      const newComponent = {
        ...state.currentComponent,
        tree: Model.deleteSubtree(selectedElement, state.currentComponent.tree),
      };
      showNewComponent(newComponent);
      event.stopPropagation();
      event.preventDefault();
    }
  };
};

const installMessageHandler = () => {
  window.onmessage = (event) => {
    if (event.data.command === "select" && event.data.id) {
      selectElementWithId(event.data.id);
    } else if (event.data.command === "dragstart") {
      startDragFromModel(event.data.id);
    } else if (event.data.command === "drag") {
      const iframeBcr = getPaperElement().getBoundingClientRect();
      const displacedData = {
        ...event.data,
        x: event.data.x + iframeBcr.left,
        y: event.data.y + iframeBcr.top,
        left: event.data.left + iframeBcr.left,
        top: event.data.top + iframeBcr.top,
      };
      placeMarkerWithCoordinates(displacedData);
    } else if (event.data.command === "drop") {
      dropElementWithData(hoverInfo);
    } else {
      const token = event.data.token;
      const fn = callbacks[token];
      console.log("unrecognized command " + JSON.stringify(event.data));
      if (fn) {
        delete callbacks[token];
        fn(event.data);
      }
    }
  };
};

const getElementCoordinatesFromCanvas = (id, fn) => {
  comodMessage({ command: "get_element_coordinates_for_id", id }, fn);
};

const getElementFromCanvas = (x, y, fn) => {
  comodMessage({ command: "get_element_coordinates_for_point", x, y }, fn);
};

const getPaletteContent = (fn) => {
  comodMessage({ command: "get_palette_content" }, (data) => {
    fn(data.paletteContent);
  });
};

const getExtensions = (fn) => {
  comodMessage({ command: "get_file_extensions" }, (data) => {
    fn(data.fileExtensions);
  });
};

/**
 *
 * @param {string} currentComponentSrc the current component file source
 * @param {*} updatedComponent the component as it is in the editor
 * @param {*} fn callback that gets the updated component
 */
const updateComponent = (currentComponentSrc, updatedComponent, fn) => {
  comodMessage(
    {
      command: "update_component",
      tag: updatedComponent.tag,
      currentComponentSrc,
      updatedComponent,
    },
    (data) => {
      fn(data.updatedComponentSrc, data.updatedComponent);
    }
  );
};

const insertComponentIntoPalette = (component) => {
  const el = $("#component-palette");
  const div = document.createElement("div");
  div.appendChild(
    createPaletteEntry("span", component.tag, [component.tag, "(", ")"])
  );
  div.appendChild(createPaletteEntry("span", "expand", component.tree));
  el.appendChild(div);
};

const parseComponent = (contentAndInfo) => {
  comodMessage({ command: "parse_component", ...contentAndInfo }, (data) => {
    // TODO change all of the functions below so that they get updated with only the one component that just go parsed. #88
    const component = { tree: data.tree, ...data.fileInfo };
    //    palette.push(component);
    storedComponents.components[component.tag] = component;
    insertComponentIntoPalette(component);
    populateComponentSelectors();
    selectFirstComponent();
  });
};

const comodMessage = (message, callback?) => {
  console.log("sending message: " + JSON.stringify(message));
  if (callback) {
    callbacks[messageTokenCounter] = callback;
    message.token = messageTokenCounter;
    messageTokenCounter++;
  }
  $("#visual-editor").contentWindow.postMessage(message, "*");
};

const setupTextEditor = () => {
  // eslint-disable-next-line no-undef
  textEditor = CodeMirror($("#text-editor"), {
    mode: "text/css",
    theme: "tomorrow-night-eighties",
    extraKeys: { "Ctrl-Space": "autocomplete" },
  });
};

const insertCssAtCursor = (cssText) => {
  const pos = textEditor.getCursor();
  textEditor.replaceRange(cssText, pos);
};

const setupCssRules = (filter?) => {
  const el = $("#css-rules");
  el.innerHTML = "";
  Object.keys(cssProperties).forEach((key) => {
    if (!filter || key.includes(filter)) {
      const header = document.createElement("h2");
      header.textContent = key;
      el.appendChild(header);
      cssProperties[key].forEach((propName) => {
        const div = document.createElement("div");
        div.textContent = propName;
        div.onclick = () => {
          insertCssAtCursor(propName + ":");
        };
        div.oncontextmenu = (event) => {
          window.open(
            `https://developer.mozilla.org/en-US/docs/Web/CSS/${propName}`,
            "_blank"
          );
          event.preventDefault();
          event.stopPropagation();
        };
        el.appendChild(div);
      });
    }
  });
};

const installFileAPI = async () => {
  const nameToHandle: Record<string, any> = {};
  const fileAPI: FileAPI = {
    fileAPIInstalled: true,
    saveFile: async (fileName: string, content: string) => {
      const writable = await nameToHandle[fileName].createWritable();
      await writable.write(content);
      await writable.close();
    },
    loadFile: async (name: string) => {
      return await (await nameToHandle[name].getFile()).text();
    },
    parseComponents: (extensionsFn, parseFn) => {
      extensionsFn(async (extensions) => {
        const componentScanFn = async () => {
          $("#choose-and-save").style.display = "inline";

          const parseDir = async (currentPath, dirHandle) => {
            for await (const [name, handle] of dirHandle.entries()) {
              const fullPath = currentPath + name;
              nameToHandle[fullPath] = handle;
              if (handle.kind === "directory") {
                if (name !== "node_modules") {
                  parseDir(currentPath + name + "/", handle);
                }
              } else {
                const extension = name.slice(name.lastIndexOf(".") + 1);
                console.log("extension: " + extension);
                if (extensions.includes(extension)) {
                  //const fullPath = dirName + "/" + name;
                  const fullPath = currentPath + name;
                  const content = await (await handle.getFile()).text();
                  parseFn({
                    content,
                    fileInfo: {
                      tag: name.replace("." + extension, ""),
                      css: "",
                      path: fullPath,
                      type: extension,
                    },
                  });
                }
              }
            }
          };
          parseDir("./", await window.showDirectoryPicker());
        };

        $("#scan-components").onclick = () => {
          $("#intro-text").style.display = "none";
          componentScanFn();
        };
      });
    },
  };

  (window as any).GUIBuilder = fileAPI;
};

const initGUIBuilder = () => {
  if (!(window as any).GUIBuilder || !getFileAPI().fileAPIInstalled) {
    installFileAPI();
  } else {
    $("choose-and-save").style.display = "inline";
  }
  setupTextEditor();
  // setupCssRules();
  installUIEventHandlers();
  installKeyboardHandlers();
  installMessageHandler();
  $("#visual-editor").contentWindow.onload = () => {
    populatePalette();
    showPalettePanel();
    ((window as any).GUIBuilder as FileAPI).parseComponents(
      getExtensions,
      parseComponent
    );
  };
};

initGUIBuilder();
