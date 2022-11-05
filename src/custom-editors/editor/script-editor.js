const fn = (rect, DCAPI) => {
  const el = rect.el;
  const ta = document.createElement("textarea");
  ta.style.width = "100%";
  ta.style.height = "100%";
  ta.oninput = event => {
    rect.props.textContent = ta.value;
    DCAPI.repaint();
    event.stopPropagation();
  };
  ta.onmousedown = event => {
    event.stopPropagation();
  };
  el.appendChild(ta);
};

export const scriptEditor = {
  name: "script-editor",
  displayname: "JavaScript editor",
  fn: fn
};
