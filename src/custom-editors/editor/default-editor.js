import {
  createPropertyEditor,
  createPropertyEditorTextArea,
} from "../dc-editor-fields";

const fn = (el, CEAPI) => {
  el.textContent = "";

  const attribute = (id, caption, table) => {
    table.appendChild(
      createPropertyEditor(caption, CEAPI.props[id], (event) => {
        CEAPI.props[id] = event.target.value;
        CEAPI.repaint();
        event.stopPropagation();
      })
    );
  };

  const table = document.createElement("table");
  table.appendChild(
    createPropertyEditorTextArea(
      "Text",
      CEAPI.props["textContent"],
      (event) => {
        CEAPI.props["textContent"] = event.target.value;
        CEAPI.repaint();
        event.stopPropagation();
      }
    )
  );
  //attribute("textContent", "Text", table);
  attribute("id", "Id", table);
  attribute("class", "class", table);
  attribute("__variableName", "Variable name", table);

  el.appendChild(table);
};

export const defaultEditor = {
  name: "default-editor",
  displayname: "Common properties",
  fn: fn,
};
