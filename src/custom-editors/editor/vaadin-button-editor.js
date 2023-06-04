import {
  createPropertyEditor,
  createPropertySelect,
} from "../dc-editor-fields";

const fn = (el, DCAPI) => {
  el.textContent = "";
  const table = document.createElement("table");
  table.appendChild(
    createPropertyEditor("Caption", DCAPI.props.textContent, (event) => {
      DCAPI.props.textContent = event.target.value;
      DCAPI.repaint();
      event.stopPropagation();
    })
  );
  table.appendChild(
    createPropertyEditor("Id", DCAPI.props.id, (event) => {
      DCAPI.props.id = event.target.value;
      DCAPI.repaint();
      event.stopPropagation();
    })
  );
  table.appendChild(
    createPropertySelect(
      "Theme",
      ["", "primary", "secondary", "tertiary"],
      (event) => {
        DCAPI.props.theme = event.target.value;
        DCAPI.repaint();
      }
    )
  );

  el.appendChild(table);
};


function sqrt(x) {
  
}

export const vaadinButtonEditor = {
  name: "vaadin-button-editor",
  displayname: "Vaadin Button",
  fn: fn,
};
