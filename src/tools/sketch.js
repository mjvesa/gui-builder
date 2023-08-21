import { brute } from "./brute";

let $;

const ipsumLorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum".split(
    " "
  );

const childOf = (rectA, rectB) => {
  return (
    rectA.left > rectB.left &&
    rectA.top > rectB.top &&
    rectA.right < rectB.right &&
    rectA.bottom < rectB.bottom
  );
};

const isSquarish = (rect) => {
  const ratio = (rect.right - rect.left) / (rect.bottom - rect.top);
  return ratio > 0.7 && ratio < 1.3;
};

const isCheckBox = (rect) => {
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;

  return (
    isSquarish(rect) &&
    !rect.children &&
    w < 30 &&
    h < 30 &&
    (!rect.text || rect.text.includes("x"))
  );
};

const isRadioButton = (rect) => {
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;

  return (
    isSquarish(rect) &&
    !rect.children &&
    w < 30 &&
    h < 30 &&
    rect.text &&
    rect.text.includes("o")
  );
};

const isRadioGroup = (rect) => {
  if (!rect.children) {
    return false;
  }
  let result = true;
  rect.children.forEach((rect) => {
    if (!isRadioButton(rect)) {
      result = false;
    }
  });
  return result;
};

const isCheckBoxGroup = (rect) => {
  if (!rect.children) {
    return false;
  }
  let result = true;
  rect.children.forEach((rect) => {
    if (!isCheckBox(rect)) {
      result = false;
    }
  });
  return result;
};

const isSpan = (rect) => {
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;
  return w / h > 2 && h < 100 && rect.text && rect.text.includes("#");
};

const isButton = (rect) => {
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;
  return w / h > 2 && w < 150 && h < 100 && !rect.children;
};

const isSelect = (rect) => {
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;
  return (
    w / h > 2 && w > 150 && h < 100 && rect.text && rect.text.includes(",")
  );
};

const isGrid = (rect) => {
  const h = rect.bottom - rect.top;
  return h > 100 && rect.text && rect.text.includes(",");
};

const isComboBox = (rect) => {
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;
  return w / h > 2 && h < 100 && rect.text && rect.text.includes(";");
};

const isTextField = (rect) => {
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;
  return w / h > 2 && w > 150 && h < 50; // && !rect.children && !rect.text;
};

const isPasswordField = (rect) => {
  return isTextField(rect) && rect.text && rect.text.includes("*");
};

const isDatePicker = (rect) => {
  return isTextField(rect) && rect.text && rect.text.includes("$date");
};

const isTimePicker = (rect) => {
  return isTextField(rect) && rect.text && rect.text.includes("$time");
};

const isNumberField = (rect) => {
  return isTextField(rect) && rect.text && rect.text.includes("$number");
};

const isEmailField = (rect) => {
  return isTextField(rect) && rect.text && rect.text.includes("$email");
};

const isVerticalLayout = (rect) => {
  if (!rect.children || rect.children.length < 2) {
    return false;
  }
  let result = true;
  rect.children.forEach((outer) => {
    rect.children.forEach((inner) => {
      const hdiff = Math.abs(outer.left - inner.left);
      const vdiff = Math.abs(outer.top - inner.top);
      if (hdiff > vdiff) {
        result = false;
      }
    });
  });

  return result;
};

const isHorizontalLayout = (rect) => {
  if (!rect.children || rect.children.length < 2) {
    return false;
  }
  let result = true;
  rect.children.forEach((outer) => {
    rect.children.forEach((inner) => {
      const hdiff = Math.abs(outer.left - inner.left);
      const vdiff = Math.abs(outer.top - inner.top);
      if (hdiff < vdiff) {
        result = false;
      }
    });
  });

  return result;
};

const rectArea = (rect) => {
  const w = Math.abs(rect.right - rect.left);
  const h = Math.abs(rect.bottom - rect.top);
  return w * h;
};

const pointInsideRect = (rect, x, y) => {
  return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
};

const rectsIntersect = (rectA, rectB) => {
  return (
    pointInsideRect(rectA, rectB.left, rectB.top) ||
    pointInsideRect(rectA, rectB.right, rectB.top) ||
    pointInsideRect(rectA, rectB.right, rectB.bottom) ||
    pointInsideRect(rectA, rectB.left, rectB.bottom)
  );
};

const getSmallestRect = (rects) => {
  let smallestArea = rectArea(rects[0]);
  let smallest = rects[0];
  rects.forEach((rect) => {
    if (rectArea(rect) < smallestArea) {
      smallestArea = rectArea(rect);
      smallest = rect;
    }
  });
  return smallest;
};

const isSplitLayout = (rect) => {
  if (!rect.children || rect.children.length !== 3) {
    return false;
  }

  const smallest = getSmallestRect(rect.children);
  const others = rect.children.filter((rect) => rect !== smallest);

  return (
    rectsIntersect(others[0], smallest) && rectsIntersect(others[1], smallest)
  );
};

const isTabs = (rect) => {
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;
  return w / h > 2 && rect.text && rect.text.includes("|");
};

const isGridLayout = (rect) => {
  return rect.children && rect.children.length > 1 ? true : false;
};

const heuristics = [
  [isSpan, "span"],
  [isButton, "vaadin-button"],
  [isRadioButton, "radio-button"],
  [isCheckBox, "vaadin-checkbox"],
  [isRadioGroup, "vaadin-radio-group"],
  [isCheckBoxGroup, "vaadin-checkbox-group"],
  [isPasswordField, "vaadin-password-field"],
  [isSelect, "vaadin-select"],
  [isComboBox, "vaadin-combo-box"],
  [isDatePicker, "vaadin-date-picker"],
  [isTimePicker, "vaadin-time-picker"],
  [isNumberField, "vaadin-number-field"],
  [isEmailField, "vaadin-email-field"],
  [isTabs, "vaadin-tabs"],
  [isTextField, "vaadin-text-field"],
  [isGrid, "vaadin-grid"],
  [isSplitLayout, "vaadin-split-layout"],
  [isVerticalLayout, "vaadin-vertical-layout"],
  [isHorizontalLayout, "vaadin-horizontal-layout"],
  [isGridLayout, "vaadin-grid-layout"],
];

const getTagForRect = (rect) => {
  for (let i = 0; i < heuristics.length; i++) {
    const heuristic = heuristics[i];
    if (heuristic[0](rect)) {
      return heuristic[1];
    }
  }
  return "div";
};

const createTreeFromRects = (rects) => {
  const roots = [];
  rects.forEach((rect) => {
    let smallestArea = 10000000;
    let potentialParent;
    rects.forEach((parentRect) => {
      const area =
        Math.abs(parentRect.right - parentRect.left) *
        Math.abs(parentRect.bottom - parentRect.top);
      if (area < smallestArea && childOf(rect, parentRect)) {
        potentialParent = parentRect;
        smallestArea = area;
      }
    });
    if (potentialParent) {
      const children = potentialParent.children || [];
      children.push(rect);
      potentialParent.children = children;
    } else {
      roots.push(rect);
    }
  });
  return roots;
};

const showCurrentGuess = (rect, rects) => {
  const el = $("#current-guess");
  el.style.display = "inline";
  el.style.top = rect.top - 20 + "px";
  el.style.left = rect.left + "px";

  createTreeFromRects(rects);
  const tag = getTagForRect(rect);
  el.textContent = tag.replace("vaadin-", "");
  el.setAttribute("data-guess", tag);
  rects.forEach((rect) => {
    delete rect.children;
  });
};

const clearChildren = (rects) => {
  rects.forEach((rect) => {
    delete rect.children;
  });
};

const hideCurrentGuess = () => {
  $("#current-guess").style.display = "none";
};

const rectRatio = (rect) => {
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;
  return w / h;
};

const getWord = () => {
  return ipsumLorem[(Math.random() * ipsumLorem.length) | 0];
};

const VAADIN_FIELDS = [
  "vaadin-text-field",
  "vaadin-password-field",
  "vaadin-number-field",
  "vaadin-email-field",
  "vaadin-date-picker",
  "vaadin-time-picker",
];

const createAndAppendChildElements = (rects) => {
  let tree = [];
  const setAttribute = (name, value) => {
    tree.push(name, value, "=");
  };
  rects.forEach((rect) => {
    const children = [];
    let styles = "";
    const tagName = getTagForRect(rect);
    tree.push(tagName);
    tree.push("(");
    if (rect.css_props) {
      styles = rect.css_props;
    }

    styles =
      styles +
      `position: absolute; left: ${rect.left}px; top: ${rect.top}px; width: ${
        rect.right - rect.left
      }px; height: ${rect.bottom - rect.top} px;`;

    if (
      tagName !== "grid-layout" &&
      tagName !== "vaadin-vertical-layout" &&
      tagName !== "vaadin-horizontal-layout"
    ) {
      styles = styles + "margin:0.5em;";
    }

    if (
      tagName === "vaadin-radio-group" ||
      tagName === "vaadin-checkbox-group"
    ) {
      if (rectRatio(rect) < 1) {
        setAttribute("theme", "vertical");
      }
    }

    if (tagName === "vaadin-vertical-layout") {
      rect.children.sort((rectA, rectB) => {
        return rectA.top - rectB.top;
      });
    }

    if (tagName === "vaadin-horizontal-layout") {
      rect.children.sort((rectA, rectB) => {
        return rectA.left - rectB.left;
      });
    }

    if (tagName === "grid-layout") {
      styles = styles + "display:grid;";
      // Sort into left-right and top down order
      rect.children.sort((rectA, rectB) => {
        return (
          rectA.left +
          (rectA.top - rect.top - ((rectA.top - rect.top) % 50)) * 8192 -
          (rectB.left +
            (rectB.top - rect.top - ((rectB.top - rect.top) % 50)) * 8192)
        );
      });
      let columnWidth = 0;
      let maxColumnWidth = 0;
      let previous = rect.children[0];
      rect.children.forEach((rect) => {
        if (previous.left > rect.left) {
          if (columnWidth > maxColumnWidth) {
            maxColumnWidth = columnWidth;
          }
          columnWidth = 0;
        }
        columnWidth++;
        previous = rect;
      });
      styles =
        styles + `grid-template-columns:repeat(${maxColumnWidth}, auto);`;
    }

    if (tagName === "vaadin-split-layout") {
      // remove drag handle rect
      const smallest = getSmallestRect(rect.children);
      rect.children = rect.children.filter((rect) => rect !== smallest);
      // determine orientation
      const child = rect.children[0];
      if (
        pointInsideRect(child, smallest.left, smallest.top) !==
        pointInsideRect(child, smallest.left, smallest.bottom)
      ) {
        setAttribute("orientation", "vertical");
      }
    }

    // Handle text content in rect
    if (
      rect.text &&
      tagName !== "vaadin-radio-button" &&
      tagName !== "vaadin-checkbox"
    ) {
      if (tagName == "vaadin-grid") {
        const columns = rect.text.split(",");
        const columnCaptions = [];
        columns.forEach((column) => {
          columnCaptions.push({ name: column, path: column });
        });
        setAttribute("columnCaptions", JSON.stringify(columnCaptions));
        const items = [];
        for (let i = 0; i < 10; i++) {
          const item = {};
          columns.forEach((column) => {
            item[column] = getWord();
          });
          items.push(item);
        }
        setAttribute("items", JSON.stringify(items));
      } else if (rect.text.includes(",")) {
        rect.text.split(",").forEach((str) => {
          children.push("vaadin-item", "(", "textContent", str, "=", ")");
        });
      } else if (rect.text.includes("|")) {
        rect.text.split("|").forEach((str) => {
          children.push("vaadin-tab", "(", "textContent", str, "=", ")");
        });
      } else if (rect.text.includes(";")) {
        setAttribute("items", JSON.stringify(rect.text.split(";")));
      } else {
        setAttribute("textContent", rect.text.replace("#", ""));
      }
    }

    if (tagName === "vaadin-button") {
      setAttribute("textContent", getWord());
      setAttribute("theme", "primary");
    }

    if (VAADIN_FIELDS.includes(tagName)) {
      setAttribute("label", getWord());
    }

    if (rect.children) {
      if (isVerticalLayout(rect)) {
        rect.children.sort((rectA, rectB) => {
          return rectA.top - rectB.top;
        });
      } else {
        rect.children.sort((rectA, rectB) => {
          return rectA.left - rectB.left;
        });
      }
    }

    // Use brute to determine flexbox properties for div
    if (
      ["div", "vaadin-vertical-layout", "vaadin-horizontal-layout"].includes(
        tagName
      ) &&
      rect.children
    ) {
      styles = styles + brute(rect.children, rect);
    }

    if (styles.length > 0) {
      setAttribute("style", styles);
    }
    if (children.length > 0) {
      tree = tree.concat(children);
    }

    if (rect.children) {
      tree = tree.concat(createAndAppendChildElements(rect.children));
    }
    tree.push(")");
  });
  return tree;
};

const createAndAppendChildElementsToDOM = (parent, rects) => {
  rects.forEach((rect) => {
    let tagName = getTagForRect(rect);
    let el = document.createElement(tagName);

    el.style.minWidth = rect.right - rect.left + "px";
    el.style.minHeight = rect.bottom - rect.top + "px";
    el.style.width = rect.right - rect.left + "px";
    el.style.height = rect.bottom - rect.top + "px";

    let topOffset = 0;
    if (VAADIN_FIELDS.includes(tagName)) {
      topOffset = -33;
      el.style.width = "auto";
      el.style.height = "auto";
    } else if (tagName == "vaadin-button") {
      topOffset = -3;
    }

    el.style.left = rect.left + "px";
    el.style.top = topOffset + rect.top + "px";

    if (
      tagName === "vaadin-radio-group" ||
      tagName === "vaadin-checkbox-group"
    ) {
      if (rectRatio(rect) < 1) {
        el.setAttribute("theme", "vertical");
      }
    }

    if (tagName === "vaadin-vertical-layout") {
      rect.children.sort((rectA, rectB) => {
        return rectA.top - rectB.top;
      });
    }

    if (tagName === "vaadin-horizontal-layout") {
      rect.children.sort((rectA, rectB) => {
        return rectA.left - rectB.left;
      });
    }

    if (tagName === "grid-layout") {
      el.style.display = "grid";
      // Sort into left-right and top down order
      rect.children.sort((rectA, rectB) => {
        return (
          rectA.left +
          (rectA.top - rect.top - ((rectA.top - rect.top) % 50)) * 8192 -
          (rectB.left +
            (rectB.top - rect.top - ((rectB.top - rect.top) % 50)) * 8192)
        );
      });
      let columnWidth = 0;
      let maxColumnWidth = 0;
      let previous = rect.children[0];
      rect.children.forEach((rect) => {
        if (previous.left > rect.left) {
          if (columnWidth > maxColumnWidth) {
            maxColumnWidth = columnWidth;
          }
          columnWidth = 0;
        }
        columnWidth++;
        previous = rect;
      });
      el.style.gridTemplateColumns = `repeat(${maxColumnWidth}, auto)`;
    }

    if (tagName === "vaadin-split-layout") {
      // remove drag handle rect
      const smallest = getSmallestRect(rect.children);
      rect.children = rect.children.filter((rect) => rect !== smallest);
      // determine orientation
      const child = rect.children[0];
      if (
        pointInsideRect(child, smallest.left, smallest.top) !==
        pointInsideRect(child, smallest.left, smallest.bottom)
      ) {
        el.setAttribute("orientation", "vertical");
        const top = document.createElement("div");
        const bottom = document.createElement("div");

        const ratio =
          ((((smallest.top + smallest.bottom) / 2 - rect.top) /
            (rect.bottom - rect.top)) *
            100) |
          0;
        top.style.minHeight = ratio + "%";
        bottom.style.minHeight = 100 - ratio + "%";
        top.style.position = "relative";
        bottom.style.position = "relative";
        el.appendChild(top);
        el.appendChild(bottom);
      } else {
        const left = document.createElement("div");
        const right = document.createElement("div");

        const ratio =
          ((((smallest.left + smallest.right) / 2 - rect.left) /
            (rect.right - rect.left)) *
            100) |
          0;

        left.style.width = ratio + "%";
        right.style.width = 100 - ratio + "%";
        left.style.position = "relative";
        right.style.position = "relative";
        el.appendChild(left);
        el.appendChild(right);
      }
    }

    // Handle text content in rect
    if (
      rect.text &&
      tagName !== "vaadin-radio-button" &&
      tagName !== "vaadin-checkbox"
    ) {
      if (tagName == "vaadin-grid") {
        const columnNames = rect.text.split(",");
        columnNames.forEach((columnName) => {
          const column = document.createElement("vaadin-grid-column");
          column.setAttribute("path", columnName);
          column.setAttribute("header", columnName);
          el.appendChild(column);
        });
        let items = [];
        for (let i = 0; i < 200; i++) {
          let item = {};
          columnNames.forEach((columnName) => {
            item[columnName] = getWord();
          });
          items.push(item);
        }
        el.items = items;
      } else if (rect.text.includes(",")) {
        rect.text.split(",").forEach((str) => {
          let item = document.createElement("vaadin-item");
          item.textContent = str;
          el.appendChild(item);
        });
      } else if (rect.text.includes("|")) {
        rect.text.split("|").forEach((str) => {
          let tab = document.createElement("vaadin-tab");
          tab.textContent = str;
          el.appendChild(tab);
        });
      } else if (rect.text.includes(";")) {
        el.items = rect.text.split(";");
      } else {
        el.textContent = rect.text.replace("#", "");
      }
    }
    el.setAttribute("label", getWord());

    if (tagName === "vaadin-button") {
      el.textContent = rect.text ? rect.text : getWord();
      el.setAttribute("theme", "primary");
    }

    parent.appendChild(el);
    if (rect.children) {
      createAndAppendChildElementsToDOM(parent, rect.children);
    }
  });
};

const snapToNearestX = (x) => {
  return (Math.round(x / 20) * 20) | 0; // - 5;
};

const snapToNearestY = (x) => {
  return (Math.round(x / 20) * 20) | 0; // + 8;
};

const snapX = (x) => {
  return ((x / 20) | 0) * 20 + 20;
};

const snapY = (x) => {
  return ((x / 20) | 0) * 20 + 20;
};

const fixZIndexes = (rects) => {
  const fixInternal = (rects, zIndex) => {
    rects.forEach((rect) => {
      if (rect.el) {
        rect.el.style.zIndex = zIndex;
        rect.el.style.backgroundColor = `rgb(${255 - zIndex * 32},${
          255 - zIndex * 32
        },${255 - zIndex * 32})`;

        if (rect.children) {
          fixInternal(rect.children, zIndex + 1);
        }
      }
    });
  };
  fixInternal(rects, 1);
};

export const enterSketchMode = (targetEl, renderCallback, designCallback) => {
  let rects = [];
  let draggedEl;
  let draggedRect = {};
  let originX, originY;
  let focusedElement;

  $ = targetEl.querySelector.bind(targetEl);
  targetEl.innerHTML = `
  <style>

    #relative-wrapper {
      position:relative;
      height: 100%;
      width: 100%;
    }

    #sketch-canvas {
      display: block;
      height: 100%;
      width: 100%;
      background-size: 20px 20px;
      background-image:
        linear-gradient(to right, lightgrey 1px, transparent 1px),
        linear-gradient(to bottom, lightgrey 1px, transparent 1px);
    }
    #preview-canvas {
      position: absolute;
      top: 0px;
      height: 100%;
      width: 100%;
      pointer-events: none;
    }

    #preview-canvas * {
      position: absolute;
    }

    #preview-canvas vaadin-tab {
      position: relative;
    }

    #sketch-canvas div {
        border: solid 1px black;
        position: absolute;
        opacity: 0.2;
        cursor: default;
    }

    #sketch-canvas div#snap-cursor {
      position: absolute;
      width: 5px;
      height: 5px;
      border: 2px solid black;
      z-index: 100000;
      pointer-events: none;
      opacity: 1.0;
    }

    #sketch-canvas div:hover {
      opacity: 0.8;
    }
      #current-guess {
        display: none;
        position: absolute;
        z-index: 10000;
    }
  </style>
  <vaadin-button id="generate-button"><iron-icon icon="vaadin:vaadin-h"></iron-icon></vaadin-button>
  <div id="relative-wrapper">
    <div id="sketch-canvas">
     <div id="snap-cursor"></div>
      <span id="current-guess"></span>
    </div>
    <div id="preview-canvas"></div>
  </div>`;

  const canvas = $("#sketch-canvas");
  canvas.onkeydown = (event) => {
    if (event.key === "Delete") {
      if (focusedElement) {
        rects = rects.filter((rect) => rect !== focusedElement.rect);
        canvas.removeChild(focusedElement);
        hideCurrentGuess();
        updatePreview();
      }
    }
  };

  canvas.onmousedown = (event) => {
    draggedEl = document.createElement("div");
    draggedEl.style.zIndex = 1000;
    draggedRect = { el: draggedEl };

    draggedEl.rect = draggedRect;
    draggedEl.contentEditable = true;
    draggedEl.oninput = (event) => {
      event.target.rect.text = event.target.textContent;
      showCurrentGuess(event.target.rect, rects);
      updatePreview();
    };

    draggedEl.onmouseover = (event) => {
      event.target.focus();
      focusedElement = event.target;
      showCurrentGuess(event.target.rect, rects);
      event.stopPropagation();
    };

    const bcr = canvas.getBoundingClientRect();
    originX = snapToNearestX(event.clientX - bcr.left);
    originY = snapToNearestY(event.clientY - bcr.top);
    draggedEl.style.position = "absolute";
    draggedEl.style.left = originX + "px";
    draggedEl.style.top = originY + "px";

    canvas.appendChild(draggedEl);
  };

  canvas.onmousemove = (event) => {
    const bcr = canvas.getBoundingClientRect();
    const mouseX = event.clientX - bcr.left;
    const mouseY = event.clientY - bcr.top;

    const snapCursor = $("#snap-cursor");

    if (draggedEl) {
      snapCursor.style.display = "none";
      draggedEl.style.width = snapX(mouseX - originX) + "px";
      draggedEl.style.height = snapY(mouseY - originY) + "px";
      Object.assign(draggedRect, {
        left: originX,
        top: originY,
        right: snapX(mouseX),
        bottom: snapY(mouseY),
      });
      showCurrentGuess(draggedRect, rects);
    } else {
      snapCursor.style.display = "block";
      snapCursor.style.left = snapToNearestX(mouseX) - 3 + "px";
      snapCursor.style.top = snapToNearestY(mouseY) - 3 + "px";
    }
  };

  canvas.onmouseup = () => {
    rects.push(draggedRect);
    draggedEl = undefined;
    hideCurrentGuess();
    const roots = createTreeFromRects(rects);
    fixZIndexes(roots);
    updatePreview();
  };

  const updatePreview = () => {
    clearChildren(rects);
    renderCallback(createAndAppendChildElements(createTreeFromRects(rects)));
    //   $("#preview-canvas").innerHTML = "";
    //   createAndAppendChildElementsToDOM(
    //     $("#preview-canvas"),
    //     createTreeFromRects(rects)
    //   );
  };

  $("#generate-button").onclick = () => {
    hideCurrentGuess();
    clearChildren(rects);
    designCallback(createAndAppendChildElements(createTreeFromRects(rects)));
  };
};
