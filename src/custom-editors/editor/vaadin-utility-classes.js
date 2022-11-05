import { utilityClassNames } from "./vaadin-utility-classnames";

const fn = (el, DCAPI) => {
  el.innerHTML = "";
  const initialClasses = (DCAPI.props.class || "").split(" ");

  const detailsStack = [];
  const buildTree = (el, tree) => {
    for (const key of Object.keys(tree)) {
      const entry = tree[key];
      const details = document.createElement("details");
      detailsStack.push(details);
      details.style.paddingLeft = "1em";
      const summary = document.createElement("summary");
      summary.textContent = key;
      details.appendChild(summary);
      el.appendChild(details);
      if (Array.isArray(entry)) {
        for (const propName of entry) {
          const propIsSet = initialClasses.includes(propName);
          const tpl = document.createElement("template");
          tpl.innerHTML = `<input type="checkbox" id="util-${propName}" ${
            propIsSet ? "checked" : ""
          }>
         <label for="util-${propName}">${propName}</label><br>`;
          if (propIsSet) {
            for (const d of detailsStack) {
              d.setAttribute("open", true);
            }
          }
          details.appendChild(tpl.content);
          details.querySelector(`#util-${propName}`).onclick = () => {
            let classes = (DCAPI.props.class || "").split(" ");
            if (classes.includes(propName)) {
              classes.splice(classes.indexOf(propName), 1);
            } else {
              classes.push(propName);
            }
            DCAPI.props.class = classes.join(" ");
            DCAPI.repaint();
          };
        }
      } else {
        buildTree(details, entry);
      }
      detailsStack.pop();
    }
  };
  buildTree(el, utilityClassNames);
};

export const vaadinUtilityClasses = {
  name: "utility-classes",
  displayname: "Vaadin Utility Classes",
  fn: fn,
};
