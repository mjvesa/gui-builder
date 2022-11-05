import { fieldsFromProperties } from "../dc-editor-fields";

const fn = (rect, DCAPI) => {
  const gridProps = [["display", "finite", ["grid", "grid-inline"]]];

  const el = rect.el;
  el.textContent = "";
  const table = document.createElement("table");
  rect.style.display = "flex";
  fieldsFromProperties(flexboxProps, table, rect, DCAPI);
  el.appendChild(table);
};

export const flexboxEditor = {
  name: "grid-editor",
  displayname: "Grid container",
  fn: fn,
};
