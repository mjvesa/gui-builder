import { fieldsFromProperties } from "../dc-editor-fields";

const fn = (el, DCAPI) => {
  const content = `    
  #margin-box {
    color: white;
    position: fixed;
    left: 50px;
    top: 50px;
    width: 500px;
    height: 500px;
    background-color: #ae8152;
   }

  #border-box {
    position: fixed;
    left: 100px;
    top: 100px;
    width: 400px;
    height: 400px;
    background-color: #e3c381;
   }

  #padding-box {
    position: fixed;
    left: 150px;
    top: 150px;
    width: 300px;
    height: 300px;
    background-color:  #b6c37e;
   }

  #size-box {
    position: fixed;
    left: 200px;
    top: 200px;
    width: 200px;
    height: 200px;
    background-color:  #87b0bc;
   }
   
   #target {
      position: relative;
      display: inline-block;
/*          left: 100px;
      top: 100px;*/
      width: 200px;
      height: 200px;
      background-color: #b6c37e;
      border-style: solid;
      border-color: black;
      color: white;
   }
   
   #content {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #87b0bc;
   }
   
   #outer {
      position: relative;
      display: inline-block;
      left: 700px;
      top: 100px;
      min-width: 200px;
      min-height: 200px;
      background-color: #ddd;
   }
</style>

<div id="margin-box">
  margin
  <div id="border-box">
   border
   <div id="padding-box">
      padding
      <div id="size-box">size</div>
   </div>
  </div>
</div>
<div id="outer">
  <div id="target">
    <div id="content">
    </div>
  </div>
</div>

`;
  const sizeProps = [
    ["box-sizing", "finite", ["border-box", "content-box"]],
    ["width", "size"],
    ["min-width", "size"],
    ["max-width", "size"],
    ["height", "size"],
    ["min-height", "size"],
    ["max-height", "size"]
  ];
  el.innerHTML = content;
  // TODO remove old stuff, replace with visual editing of sizes and such
  const table = document.createElement("table");
  fieldsFromProperties(sizeProps, table, DCAPI);
  el.appendChild(table);

  let currentElement;
  let position = "right";
  let property = "";
  const style = document.getElementById("target").style;

  /*      style.border = "0px"; */
  style.borderColor = "black";
  style.borderStyle = "solid";
  style.width = "200px";
  style.height = "200px";

  document.body.onmouseup = event => {
    currentElement = null;
    event.stopPropagation();
  };

  document.body.onmousemove = event => {
    if (currentElement) {
      console.log("moving " + property);
      const style = document.getElementById("target").style;
      let prop = property;

      let postfix = "-" + position;
      if (property === "border") {
        postfix = postfix + "-width";
      }

      if (property === "size") {
        postfix = "";
        if (position === "top" || position === "bottom") {
          prop = "height";
        } else {
          prop = "width";
        }
      }

      if (position === "top") {
        currentElement.style.top =
          currentElement.offsetTop + event.movementY + "px";
        currentElement.style.height =
          currentElement.offsetHeight - event.movementY + "px";
        style[prop + postfix] =
          +style[prop + postfix].replace("px", "") - event.movementY + "px";
      }

      if (position === "left") {
        currentElement.style.left =
          currentElement.offsetLeft + event.movementX + "px";
        currentElement.style.width =
          currentElement.offsetWidth - event.movementX + "px";
        style[prop + postfix] =
          +style[prop + postfix].replace("px", "") - event.movementX + "px";
      }

      if (position === "right") {
        currentElement.style.width =
          currentElement.offsetWidth + event.movementX + "px";
        style[prop + postfix] =
          +style[prop + postfix].replace("px", "") + event.movementX + "px";
      }

      if (position === "bottom") {
        currentElement.style.height =
          currentElement.offsetHeight + event.movementY + "px";
        style[prop + postfix] =
          +style[prop + postfix].replace("px", "") + event.movementY + "px";
      }
    }
    event.stopPropagation();
  };

  const sizer = prop => {
    return event => {
      const el = event.target;
      currentElement = el;
      event.preventDefault();
      event.stopPropagation();

      if (event.clientX < el.offsetLeft + 25) {
        position = "left";
      }
      if (event.clientY < el.offsetTop + 25) {
        position = "top";
      }
      if (event.clientX > el.offsetLeft + el.offsetWidth - 25) {
        position = "right";
      }
      if (event.clientY > el.offsetTop + el.offsetHeight - 25) {
        position = "bottom";
      }
      property = prop;
    };
  };

  document.getElementById("margin-box").onmousedown = sizer("margin");
  document.getElementById("border-box").onmousedown = sizer("border");
  document.getElementById("padding-box").onmousedown = sizer("padding");
  document.getElementById("size-box").onmousedown = sizer("size");
};

export const sizesEditor = {
  name: "sizes-editor",
  displayname: "Sizes editor",
  fn: fn
};
