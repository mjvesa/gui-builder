/**
 *
 * @param {*} bean A Java bean. The getX and isX methods with their return types are
 * used to gerate a crud view.
 */

const FIELD_TYPES = {
  String: ["vaadin-text-field", "(", "label", "*placeholder*", "=", ")"],
  Boolean: ["vaadin-checkbox", "(", "textContent", "*placeholder*", "=", ")"],
  Integer: ["vaadin-number-field", "(", "label", "*placeholder*", "=", ")"],
  Long: ["vaadin-number-field", "(", "label", "*placeholder*", "=", ")"],
};
export const generateCrudFromBean = (bean) => {
  const getterMatcher = /([A-Z]\S*)\s(get|is)(\S*)\(/g;
  const packageMatcher = /package\s([a-z]+(\.[a-z]+)*);/;
  const classNameMatcher = /public\s+class\s+([A-Z][a-z]*)\s*{/;
  const matches = bean.matchAll(getterMatcher);
  const className = bean.match(classNameMatcher);
  const packageName = bean.match(packageMatcher);
  let fields = [];
  let gridColumns = "";
  let paths = [];

  for (let match of matches) {
    let fieldCode = FIELD_TYPES[match[1]].slice() || [
      "vaadin-text-field",
      "(",
      "label",
      "*placeholder*",
      "=",
      ")",
    ];
    fieldCode[fieldCode.indexOf("*placeholder*")] = match[3];
    fields = fields.concat(fieldCode);

    gridColumns =
      gridColumns + `{\"name\": \"${match[3]}\", \"path\": \"${match[3]}\"},`;
    paths.push(match[3]);
  }

  let items = "";
  for (let i = 0; i < 20; i++) {
    let item = "{";
    for (let path of paths) {
      item = item + `"${path}": "aaa",`;
    }
    items = items + item.substring(0, item.length - 1) + "},";
  }

  return [
    "vaadin-split-layout",
    "(",
    "style",
    "width:100%;height:100%",
    "=",
    "vaadin-vertical-layout",
    "(",
    "style",
    "width:75%",
    "=",
  ]
    .concat([
      "vaadin-grid",
      "(",
      "style",
      "width:100%;height:100%",
      "=",
      "entity",
      packageName[1] + "." + className[1],
      "=",
      "columnCaptions",
      "[" + gridColumns.substring(0, gridColumns.length - 1) + "]",
      "=",
      "items",
      "[" + items.substring(0, items.length - 1) + "]",
      "=",
      ")",
    ])

    .concat([
      ")",
      "vaadin-vertical-layout",
      "(",
      "theme",
      "spacing margin",
      "=",
      "style",
      "width:25%",
      "=",
      "vaadin-form-layout",
      "(",
      "theme",
      "margin",
      "=",
    ])
    .concat(fields)
    .concat([
      "vaadin-horizontal-layout",
      "(",
      "theme",
      "spacing margin",
      "=",
      "vaadin-button",
      "(",
      "textContent",
      "Cancel",
      "=",
      "theme",
      "primary",
      "=",
      ")",
      "vaadin-button",
      "(",
      "textContent",
      "Save",
      "=",
      "theme",
      "primary",
      "=",
      ")",
      ")",
      ")",
    ])
    .concat(")", ")");
};
