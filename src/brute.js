const flexboxProps = [
  ["flex-direction", ["row", "row-reverse", "column", "column-reverse"]],
  [
    "justify-content",
    [
      "flex-start",
      "flex-end",
      "center",
      "space-between",
      "space-around",
      "space-evenly"
    ]
  ],
  [
    "align-items",
    [
      "stretch",
      "center",
      "flex-start",
      "flex-end",
      "baseline",
      "initial",
      "inherit"
    ]
  ],
  [
    "align-content",
    [
      "stretch",
      "center",
      "flex-start",
      "flex-end",
      "space-between",
      "space-around",
      "initial",
      "inherit"
    ]
  ]
];

const get_pos = (parentEl, el) => {
  return {
    left: el.offsetLeft - parentEl.offsetLeft,
    top: el.offsetTop - parentEl.offsetTop,
    width: el.offsetWidth,
    height: el.offsetHeight
  };
};

const calc_distance = (p1, p2) => {
  return (
    (p1.left - p2.left) * (p1.left - p2.left) +
    (p1.top - p2.top) * (p1.top - p2.top) +
    (p1.width - p2.width) * (p1.width - p2.width) +
    (p1.height - p2.height) * (p1.height - p2.height)
  );
};

export const brute = (rects, parent) => {
  const flex_container = document.createElement("div");
  flex_container.style.display = "flex";
  flex_container.style.width = parent.right - parent.left + "px";
  flex_container.style.height = parent.bottom - parent.top + "px";
  document.body.appendChild(flex_container);

  const positions = [];
  const flexblocks = [];
  for (const rect of rects) {
    const pos = {
      left: rect.left - parent.left,
      top: rect.top - parent.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top
    };
    positions.push(pos);
    const el = document.createElement("div");
    el.style.overflow = "hidden";
    el.style.backgroundColor = "blue";
    el.textContent = "Rect";
    flex_container.appendChild(el);
    flexblocks.push(el);
  }

  const indexes = [];
  let total = 1;
  for (let i = 0; i < flexboxProps.length; i++) {
    indexes[i] = 0;
    total *= flexboxProps[i][1].length;
  }

  let running = true;
  let rounds = 0;
  let best = indexes.slice;
  let best_distance = 10000000;
  do {
    for (let i = 0; i < flexboxProps.length; i++) {
      flex_container.style[flexboxProps[i][0]] = flexboxProps[i][1][indexes[i]];
    }

    const fpositions = [];

    for (let block of flexblocks) {
      fpositions.push(get_pos(flex_container, block));
    }

    let distance = 0;
    for (let i = 0; i < rects.length; i++) {
      distance += calc_distance(fpositions[i], positions[i]);
    }

    if (distance < best_distance) {
      best = indexes.slice();
      best_distance = distance;
    }

    let current_index = 0;
    let adding_indexes = true;
    do {
      indexes[current_index]++;
      if (indexes[current_index] === flexboxProps[current_index][1].length) {
        indexes[current_index] = 0;
        current_index++;
        if (current_index === flexboxProps.length) {
          running = false;
          adding_indexes = false;
        }
      } else {
        adding_indexes = false;
      }
    } while (adding_indexes);
    rounds++;
  } while (running);

  let css_props = "display: flex;";

  for (let i = 0; i < flexboxProps.length; i++) {
    flex_container.style[flexboxProps[i][0]] = flexboxProps[i][1][best[i]];
    css_props =
      css_props +
      [flexboxProps[i][0]] +
      ": " +
      flexboxProps[i][1][best[i]] +
      ";";
  }

  const flexItemProps = [
    { "flex-grow": 1, "flex-shrink": 0, "flex-basis": "auto" },
    { "flex-grow": 0, "flex-shrink": 1, "flex-basis": "auto" },
    { "flex-grow": 0, "flex-shrink": 0, "flex-basis": 0 }
  ];

  const flexItemPropStrings = [
    "flex: 1 0 auto;",
    "flex: 0 1 auto;",
    "flex: 0 0 0;"
  ];

  best_distance = 1000000;
  let best_item_props = 0;
  for (let rectI = 0; rectI < Math.pow(3, rects.length); rectI++) {
    let index = rectI;
    for (let j = 0; j < rects.length; j++) {
      Object.assign(flexblocks[j].style, flexItemProps[index % 3]);
      index = (index / 3) | 0;
    }

    const fpositions = [];
    for (let block of flexblocks) {
      fpositions.push(get_pos(flex_container, block));
    }

    let distance = 0;
    for (let i = 0; i < rects.length; i++) {
      distance += calc_distance(fpositions[i], positions[i]);
    }

    if (distance < best_distance) {
      best_item_props = rectI;
      best_distance = distance;
    }
  }

  let index = best_item_props;
  for (let j = 0; j < rects.length; j++) {
    rects[j].css_props = flexItemPropStrings[index % 3];
    index = (index / 3) | 0;
  }

  document.body.removeChild(flex_container);

  return css_props;
};
