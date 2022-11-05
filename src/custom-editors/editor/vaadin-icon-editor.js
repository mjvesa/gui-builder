import "@vaadin/vaadin-icons";
import {
  createPropertyEditor,
  createPropertySelect,
} from "../dc-editor-fields-new";

import { icons } from "./icons";

const fn = (el, DCAPI) => {
  el.textContent = "";

  const table = document.createElement("table");
  const { tr: propSelect, input } = createPropertySelect(
    "Icon",
    "icon",
    DCAPI.props,
    icons.map((x) => "vaadin:" + x),
    DCAPI
  );

  table.appendChild(propSelect);
  table.style.tableLayout = "auto";
  el.appendChild(table);

  const iconTable = document.createElement("table");
  let tr = document.createElement("tr");
  iconTable.appendChild(tr);
  let col = 0;
  for (const icon of icons) {
    const iconEl = document.createElement("iron-icon");
    const fullName = "vaadin:" + icon;
    iconEl.setAttribute("icon", fullName);
    const td = document.createElement("td");
    td.style.textAlign = "center";
    const div = document.createElement("div");
    div.textContent = icon;
    td.appendChild(iconEl);
    td.appendChild(div);
    td.style.cursor = "pointer";
    td.onclick = () => {
      input.value = fullName;
      DCAPI.props.icon = fullName;
      DCAPI.repaint();
    };
    tr.appendChild(td);

    col++;
    if (col === 3) {
      col = 0;
      tr = document.createElement("tr");
      iconTable.appendChild(tr);
    }
  }
  el.appendChild(iconTable);
};

export const vaadinIconEditor = {
  name: "vaadin-icon-editor",
  displayname: "Vaadin Icon",
  fn: fn,
};
