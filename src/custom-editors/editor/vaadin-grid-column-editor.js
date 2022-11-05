import {
  createPropertyEditor,
  createPropertySelect
} from "../dc-editor-fields";

const fn = (rect, DCAPI) => {
  const el = rect.el;
  el.textContent = "";
  const table = document.createElement("table");
  table.appendChild(
    createPropertyEditor("Header", event => {
      rect.attributes.header = event.target.value;
      DCAPI.repaint();
      event.stopPropagation();
    })
  );
  table.appendChild(
    createPropertyEditor("Path", event => {
      rect.attributes.path = event.target.value;
      DCAPI.repaint();
      event.stopPropagation();
    })
  );

  el.appendChild(table);
};

export const vaadinGridColumnEditor = {
  name: "vaadin-grid-column-editor",
  displayname: "Vaadin Grid column editor",
  fn: fn
};
