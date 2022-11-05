export const ATIRToXML = (atir) => {
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

        if (nos === "style") {
          result = result.concat(
            ` ${nos}={{${tos
              .replace(/;/g, '",')
              .replace(/-([a-z])/g, function (g) {
                return g[1].toUpperCase();
              })
              .replace(/:/g, ':"')
              .concat('"')}}}`
          );
        } else if (nos === "textContent") {
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

export const XMLToATIR = (html) => {
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
  parseTree(document.body);

  return atir;
};
