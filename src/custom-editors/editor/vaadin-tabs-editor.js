import { createPropertySelect } from "../dc-editor-fields";

const fn = (el, DCAPI) => {
  el.textContent = "";
  const table = document.createElement("table");
  table.appendChild(
    createPropertySelect("Orientation", ["horizontal", "vertical"], (event) => {
      DCAPI.props.orientation = event.target.value;
      DCAPI.repaint(DCAPI.props);
      event.stopPropagation();
    })
  );
  el.appendChild(table);
};

export const vaadinTabsEditor = {
  name: "vaadin-tabs-editor",
  displayname: "Vaadin Tabs",
  fn: fn,
};
