import { fieldsFromProperties } from "../dc-editor-fields";

const fn = (el, DCAPI) => {
  // Create a textfield and load JSON from it when a specified element is clicked.
  const sizeProps = [
    ["box-sizing", "finite", ["border-box", "content-box"]],
    ["width", "size"],
    ["min-width", "size"],
    ["max-width", "size"],
    ["height", "size"],
    ["min-height", "size"],
    ["max-height", "size"]
  ];
  el.innerHTML = "";
  const table = document.createElement("table");
  fieldsFromProperties(sizeProps, table, DCAPI);
  el.appendChild(table);
};

export const sizesEditor = {
  name: "sizes-editor",
  displayname: "Sizes editor",
  fn: fn
};
