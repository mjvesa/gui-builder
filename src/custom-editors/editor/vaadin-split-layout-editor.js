import { createPropertySelect } from "../dc-editor-fields";

const fn = (rect, DCAPI) => {
  const el = rect.el;
  el.textContent = "";
  const table = document.createElement("table");
  table.appendChild(
    createPropertySelect("Orientation", ["horizontal", "vertical"], event => {
      if (!rect.props) {
        rect.props = {};
      }
      rect.props.orientation = event.target.value;
      DCAPI.repaint();
      event.stopPropagation();
    })
  );
  el.appendChild(table);
};

export const vaadinSplitLayoutEditor = {
  name: "vaadin-split-layout-editor",
  displayname: "Vaadin Split Layout editor",
  fn: fn
};
