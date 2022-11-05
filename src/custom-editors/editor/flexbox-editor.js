import {
  createPropertyEditor,
  createPropertySelect,
  fieldsFromProperties,
} from "../dc-editor-fields";

const fn = (el, DCAPI) => {
  const flexboxProps = [
    //    ["flex"], "This is the shorthand for flex-grow, flex-shrink and flex-basis combined.", do we need it?
    ["flex-grow", "number"],
    ["flex-shrink", "number"],
    ["flex-basis", "size"],
    ["flex-flow", "finite", ["flex-direction", "flex-wrap"]],
    [
      "flex-direction",
      "finite",
      ["row", "row-reverse", "column", "column-reverse"],
    ],
    ["flex-wrap", "finite", ["nowrap", "wrap", "wrap-reverse"]],
    [
      "align-items",
      "finite",
      [
        "stretch",
        "center",
        "flex-start",
        "flex-end",
        "baseline",
        "initial",
        "inherit",
      ],
    ],
    [
      "justify-content",
      "finite",
      [
        "stretch",
        "center",
        "flex-start",
        "flex-end",
        "space-between",
        "space-around",
        "initial",
        "inherit",
      ],
    ],
    ,
    [
      "align-self",
      "finite",
      ["auto", "flex-start", "flex-end", "center", "baseline", "stretch"],
    ],
    ["order", "number"],
  ];

  el.textContent = "";
  const table = document.createElement("table");
  fieldsFromProperties(flexboxProps, table, DCAPI);
  el.appendChild(table);
};

export const flexboxEditor = {
  name: "flexbox-editor",
  displayname: "Flexbox",
  fn: fn,
};
