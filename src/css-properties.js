export const cssProperties = {
  // Major display ///////////////////////////////////////////////////////////

  Display: ["display", "opacity", "visibility", "z-index"],
  "@viewport and zoom": [
    "orientation",
    "max-zoom",
    "min-zoom",
    "user-zoom",
    "zoom" // (both @viewport and standard property)
  ],
  Position: ["position", "top", "right", "bottom", "left"],

  // Grids (upcoming)

  Flexbox: [
    "flex",
    "flex-grow",
    "flex-shrink",
    "flex-basis",
    "flex-flow",
    "flex-direction",
    "flex-wrap",
    "justify-content",
    "align-items",
    "align-content",
    "align-self",
    "order"
  ],

  Floats: ["float", "clear"],

  // Box /////////////////////////////////////////////////////////////////////

  Dimensions: [
    "box-sizing",
    "width",
    "min-width",
    "max-width",
    "height",
    "min-height",
    "max-height"
  ],

  "Spacing and borders": [
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "border",
    "border-width",
    "border-style",
    "border-color",
    "border-top",
    "border-top-width",
    "border-top-style",
    "border-top-color",
    "border-right",
    "border-right-width",
    "border-right-style",
    "border-right-color",
    "border-bottom",
    "border-bottom-width",
    "border-bottom-style",
    "border-bottom-color",
    "border-left",
    "border-left-width",
    "border-left-style",
    "border-left-color",
    "border-radius",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
    "border-image",
    "border-image-source",
    "border-image-slice",
    "border-image-width",
    "border-image-outset",
    "border-image-repeat",
    "border-top-image",
    "border-right-image",
    "border-bottom-image",
    "border-left-image",
    "border-corner-image",
    "border-top-left-image",
    "border-top-right-image",
    "border-bottom-right-image",
    "border-bottom-left-image"
  ],

  Outlines: [
    "outline",
    "outline-width",
    "outline-style",
    "outline-color",
    "outline-offset"
  ],

  Overflow: ["clip", "overflow", "overflow-x", "overflow-y"],

  // Box Contents ////////////////////////////////////////////////////////////

  Lists: [
    "list-style",
    "list-style-position",
    "list-style-type",
    "list-style-image"
  ],

  Table: [
    "table-layout",
    "border-spacing",
    "border-collapse",
    "caption-side",
    "empty-cells"
  ],

  Columns: [
    "columns",
    "column-width",
    "column-count",
    "column-fill",
    "column-gap",
    "column-rule",
    "column-rule-width",
    "column-rule-style",
    "column-rule-color",
    "column-span"
  ],

  Direction: ["direction"],

  "Text styles": [
    "color",
    "font",
    "font-style",
    "font-variant",
    "font-weight",
    "font-size",
    "line-height",
    "font-family",
    "font-size-adjust",
    "font-stretch",
    "text-align",
    "text-align-last",
    "text-decoration",
    "text-emphasis", // For east Asian characters
    "text-emphasis-position",
    "text-emphasis-style",
    "text-emphasis-color",
    "text-indent",
    "text-justify",
    "text-outline",
    "text-overflow",
    "text-overflow-ellipsis",
    "text-overflow-mode",
    "text-size-adjust",
    "text-transform",
    "text-wrap",
    "text-shadow",
    "vertical-align",
    "writing-mode"
  ],

  "White space": [
    "hyphens",
    "letter-spacing",
    "tab-size",
    "white-space",
    "word-break",
    "word-spacing",
    "word-wrap"
  ],

  Pointers: ["cursor"],

  Interaction: [
    "nav-index",
    "nav-up",
    "nav-right",
    "nav-down",
    "nav-left",
    "pointer-events", // (upcoming)
    "resize"
  ],

  "Generated content": [
    "content",
    "counter-increment",
    "counter-reset",
    "quotes"
  ],

  Background: [
    "background",
    "background-color",
    "background-image",
    "background-repeat",
    "background-attachment",
    "background-position",
    "background-clip",
    "background-origin",
    "background-size"
  ],

  "Behind the background": ["box-shadow"],

  Transition: [
    "transition",
    "transition-property",
    "transition-duration",
    "transition-timing-function",
    "transition-delay"
  ],

  Animation: [
    "animation",
    "animation-name",
    "animation-duration",
    "animation-timing-function",
    "animation-delay",
    "animation-iteration-count",
    "animation-direction",
    "animation-fill-mode",
    "animation-play-state"
  ],

  Transform: ["filter", "transform", "transform-origin"],

  "Print styles": [
    "box-decoration-break",
    "break-before",
    "break-inside",
    "break-after",
    "page-break-before",
    "page-break-inside",
    "page-break-after",
    "orphans",
    "widows"
  ],

  "Lumo variables": [
    "--lumo-size-xl",
    "--lumo-size-l",
    "--lumo-size-m",
    "--lumo-size-s",
    "--lumo-size-xs",
    "--lumo-border-radius",
    "--lumo-base-color",
    "--lumo-tint",
    "--lumo-tint-90pct",
    "--lumo-tint-80pct",
    "--lumo-tint-70pct",
    "--lumo-tint-60pct",
    "--lumo-tint-50pct",
    "--lumo-tint-40pct",
    "--lumo-tint-30pct",
    "--lumo-tint-20pct",
    "--lumo-tint-10pct",
    "--lumo-tint-5pct",
    "--lumo-shade",
    "--lumo-shade-90pct",
    "--lumo-shade-80pct",
    "--lumo-shade-70pct",
    "--lumo-shade-60pct",
    "--lumo-shade-50pct",
    "--lumo-shade-40pct",
    "--lumo-shade-30pct",
    "--lumo-shade-20pct",
    "--lumo-shade-10pct",
    "--lumo-shade-5pct",
    "--lumo-primary-color",
    "--lumo-primary-color-50pct",
    "--lumo-primary-color-10pct",
    "--lumo-primary-contrast-color",
    "--lumo-primary-text-color",
    "--lumo-error-color",
    "--lumo-error-color-50pct",
    "--lumo-error-color-10pct",
    "--lumo-error-contrast-color",
    "--lumo-error-text-color",
    "--lumo-success-color",
    "--lumo-success-color-50pct",
    "--lumo-success-color-10pct",
    "--lumo-success-contrast-color",
    "--lumo-success-text-color",
    "--lumo-header-text-color",
    "--lumo-body-text-color",
    "--lumo-secondary-text-color",
    "--lumo-tertiary-text-color",
    "--lumo-disabled-text-color"
  ]
};
