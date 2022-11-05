import { createPropertyEditor } from "../dc-editor-fields";

const fn = (el, DCAPI) => {
  el.textContent = "";

  const attribute = (id, caption, table) => {
    table.appendChild(
      createPropertyEditor(caption, DCAPI.props[id], (event) => {
        DCAPI.props[id] = event.target.value;
        DCAPI.repaint();
        event.stopPropagation();
      })
    );
  };

  const table = document.createElement("table");
  attribute("label", "Label", table);
  el.appendChild(table);
};

export const fieldEditor = {
  name: "field-editor",
  displayname: "Field",
  fn: fn,
};
