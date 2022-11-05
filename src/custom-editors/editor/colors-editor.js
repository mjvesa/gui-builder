// An action that loads data from a REST endpoint

const fn = (rect, DCAPI) => {
  const colorProps = [
    ["b", "size"],
    ["width", "size"],
    ["min-width", "size"],
    ["max-width", "size"],
    ["height", "size"],
    ["min-height", "size"],
    ["max-height", "size"]
  ];
  const el = rect.el;
  el.innerHTML = "";
  const table = document.createElement("table");
  fieldsFromProperties(colorProps, table, rect, DCAPI);
  el.appendChild(table);
};

export const colorsEditor = {
  name: "Colors",
  fn: fn
};
