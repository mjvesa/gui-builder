export const createPropertyEditor = (
  caption,
  id,
  obj,
  DCAPI,
  listener,
  length
) => {
  const tr = document.createElement("tr");
  const captionTd = document.createElement("td");
  captionTd.textContent = caption;
  tr.appendChild(captionTd);
  const inputTd = document.createElement("td");
  const input = document.createElement("input");
  input.onmousedown = (event) => {
    event.stopPropagation();
  };
  input.style.width = length ? length : "4rem";
  input.type = "text";
  input.value = obj[id] || "";
  input.oninput = (event) => {
    obj[id] = event.target.value;
    if (listener) {
      listener(event);
    }
    DCAPI.repaint();
  };
  inputTd.appendChild(input);
  tr.appendChild(inputTd);
  return tr;
};

export const createPropertySelect = (
  caption,
  id,
  obj,
  options,
  DCAPI,
  listener
) => {
  const tr = document.createElement("tr");
  const captionTd = document.createElement("td");
  captionTd.textContent = caption;
  tr.appendChild(captionTd);
  const inputTd = document.createElement("td");
  const input = document.createElement("select");
  input.value = obj[id] || "";
  input.onmousedown = (event) => {
    event.stopPropagation();
  };
  options.forEach((option) => {
    const optionEl = document.createElement("option");
    optionEl.textContent = option;
    input.appendChild(optionEl);
  });
  input.value = obj[id];
  input.onchange = (event) => {
    obj[id] = event.target.value;
    if (listener) {
      listener(event);
    }
    DCAPI.repaint();
  };
  inputTd.appendChild(input);
  tr.appendChild(inputTd);
  return { tr, input };
};

export const fieldsFromProperties = (properties, table, rect, DCAPI) => {
  properties.forEach((prop) => {
    switch (prop[1]) {
      case "finite": {
        const editor = createPropertySelect(
          prop[0],
          prop[0],
          rect.style,
          prop[2],
          DCAPI
        );
        table.appendChild(editor);
        break;
      }
      case "number":
      case "size":
      case "color": {
        const editor = createPropertyEditor(
          prop[0],
          prop[0],
          rect.style,
          DCAPI
        );
        table.appendChild(editor);
        break;
      }
    }
  });
};

export const findAllIds = (rects) => {
  const ids = [];
  rects.forEach((rect) => {
    if (rect.attributes.id) {
      ids.push(rect.attributes.id);
    }
  });
  return ids;
};
export const findAllIdsForTag = (rects, tag) => {
  const ids = [];
  rects.forEach((rect) => {
    if (rect.attributes.id && rect.tag === tag) {
      ids.push(rect.attributes.id);
    }
  });
  return ids;
};

export const createIdSelect = (caption, fieldId, obj, DCAPI, listener) => {
  return createPropertySelect(
    caption,
    fieldId,
    obj,
    findAllIds(DCAPI.rects),
    DCAPI,
    listener
  );
};

export const createIdSelectForTag = (
  caption,
  fieldId,
  obj,
  tag,
  DCAPI,
  listener
) => {
  return createPropertySelect(
    caption,
    fieldId,
    obj,
    findAllIds(DCAPI.rects, tag),
    DCAPI,
    listener
  );
};
