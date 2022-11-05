window.onmessage = (event) => {
  const command = event.data.command;
  //console.log("Receieved command: " + command);
  if (command === "render") {
    const el = document.querySelector("#canvas > div");
    window.Comod.render(event.data.tag, event.data.tree, el);
  } else if (command === "get_element_coordinates_for_id") {
    const el = document.querySelector(`[data-node-id="${event.data.id}"]`);
    const bcr = el.getBoundingClientRect();
    console.log(bcr);
    parent.postMessage(
      {
        command: "element",
        token: event.data.token,
        left: bcr.left,
        top: bcr.top,
        width: bcr.width,
        height: bcr.height,
      },
      "*"
    );
  } else if (command === "get_element_coordinates_for_point") {
    const el = document.elementFromPoint(event.data.x, event.data.y);
    if (el) {
      const bcr = el.getBoundingClientRect();
      console.log(bcr);
      parent.postMessage(
        {
          command: "element",
          token: event.data.token,
          id: el.getAttribute("data-node-id"),
          left: bcr.left,
          top: bcr.top,
          width: bcr.width,
          height: bcr.height,
        },
        "*"
      );
    } else {
      parent.postMessage(
        { command: "element", token: event.data.token, id: "-1" },
        "*"
      );
    }
  } else if (command === "get_palette_content") {
    parent.postMessage(
      {
        command: "palette_content",
        token: event.data.token,
        paletteContent: window.Comod.palette,
      },
      "*"
    );
  } else if (command === "get_file_extensions") {
    parent.postMessage(
      {
        command: "get_file_extensions",
        token: event.data.token,
        fileExtensions: window.Comod.fileExtensions,
      },
      "*"
    );
  } else if (command === "parse_component") {
    const content = event.data.content;
    const fileInfo = event.data.fileInfo;
    const tree = window.Comod.parse(fileInfo.tag, content, fileInfo.path);
    if (tree) {
      parent.postMessage(
        {
          command: "return_component",
          token: event.data.token,
          fileInfo: event.data.fileInfo,
          tree,
        },
        "*"
      );
    }
  } else if (command === "update_component") {
    const { tag, currentComponentSrc, updatedComponent } = event.data;
    parent.postMessage({
      command: "return_updated_component",
      token: event.data.token,
      updatedComponentSrc: window.Comod.update(
        tag,
        updatedComponent.tree,
        currentComponentSrc
      ),
      updatedComponent,
    });
  }
};

document.body.onclick = (event) => {
  let id = event.target.getAttribute("data-node-id");
  let el = event.target;
  while (!id && el && el !== document.body) {
    el = el.parentElement;
    id = el.getAttribute("data-node-id");
  }
  parent.postMessage({ command: "select", id }, "*");
  event.stopPropagation();
  event.preventDefault();
};

const body = document.body;
body.draggable = true;

body.ondragstart = (event) => {
  let el = document.elementFromPoint(event.clientX, event.clientY);
  while (el && el !== document.body && !el.getAttribute("data-node-id")) {
    el = el.parentElement;
  }

  if (el && el.getAttribute("data-node-id")) {
    event.dataTransfer.setData("text/html", null);
    parent.postMessage(
      {
        command: "dragstart",
        id: el.getAttribute("data-node-id"),
      },
      "*"
    );
  }
  event.stopPropagation();
};

body.ondragover = (event) => {
  const el = document.elementFromPoint(event.clientX, event.clientY);
  if (el && el.getAttribute("data-node-id")) {
    const bcr = el.getBoundingClientRect();
    parent.postMessage(
      {
        command: "drag",
        id: el.getAttribute("data-node-id"),
        x: event.clientX,
        y: event.clientY,
        left: bcr.left,
        top: bcr.top,
        width: bcr.width,
        height: bcr.height,
      },
      "*"
    );
  }
  event.preventDefault();
  event.stopPropagation();
};

body.ondrop = (event) => {
  parent.postMessage({ command: "drop" }, "*");
  event.preventDefault();
};
