const HTMLToATIR = (html, ignoreHead = false) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const atir = [];

  const parseTree = (parent) => {
    for (let el of parent.childNodes) {
      if (el.nodeType === Node.TEXT_NODE) {
        if (/\S/.test(el.textContent)) {
          atir.push("textContent");
          atir.push(el.textContent);
          atir.push("=");
        }
      } else if (el.nodeType !== Node.COMMENT_NODE) {
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
  return atir;
};

const ATIRToXML = (atir) => {
  let stack = [];
  let tagTree = [];

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
        if (!nos || !tos) {
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
  return result;
};

const PatchAtirProps = (atir, atirWithProps) => {
  let stack = [];
  let props = {};
  let currentPath = "";

  let result = [];

  atirWithProps.forEach((str) => {
    let trimmed = str.trim();
    switch (trimmed) {
      case "(": {
        currentPath = currentPath + "." + stack.pop();
        props[currentPath] = {};
        break;
      }
      case ")": {
        currentPath = currentPath.slice(currentPath.lastIndexOf("."));
        break;
      }
      case "=": {
        let tos = stack.pop();
        let nos = stack.pop();
        props[currentPath][nos] = tos;
        break;
      }
      default:
        stack.push(trimmed);
    }
  });

  currentPath = "";
  atir.forEach((str) => {
    let trimmed = str.trim();
    switch (trimmed) {
      case "(": {
        const tag = stack.pop();
        currentPath = currentPath + "." + tag;
        result.push(tag);
        result.push("(");
        break;
      }
      case ")": {
        if (props[currentPath]) {
          for (const [key, value] of Object.entries(props[currentPath])) {
            if (!key.startsWith("data-temp-")) {
              result.push("data-temp-" + key);
              result.push(value);
              result.push("=");
            }
          }
        }
        currentPath = currentPath.slice(currentPath.lastIndexOf("."));
        result.push(")");
        break;
      }
      case "=": {
        let tos = stack.pop();
        let nos = stack.pop();
        result.push(nos);
        result.push(tos);
        result.push("=");

        break;
      }
      default:
        stack.push(trimmed);
    }
  });
  console.log("THE MODEL: " + JSON.stringify(result));

  return result;
};

export { HTMLToATIR, ATIRToXML, PatchAtirProps };
