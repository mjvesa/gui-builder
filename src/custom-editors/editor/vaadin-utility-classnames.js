export const utilityClassNames = {
  Backgrounds: {
    Accessibility: ["sr-only"],
    Base: ["bg-base"],
    Transparent: ["bg-transparent"],

    Contrast: [
      "bg-contrast-5",
      "bg-contrast-10",
      "bg-contrast-20",
      "bg-contrast-30",
      "bg-contrast-40",
      "bg-contrast-50",
      "bg-contrast-60",
      "bg-contrast-70",
      "bg-contrast-80",
      "bg-contrast-90",
      "bg-contrast",
    ],
    Primary: ["bg-primary", "bg-primary-50", "bg-primary-10"],
    Error: ["bg-error", "bg-error-50", "bg-error-10"],
    Success: ["bg-success", "bg-success-50", "bg-success-10"],
  },

  Borders: {
    Base: [
      "border-0",
      "border",
      "border-b",
      "border-l",
      "border-r",
      "border-t",
    ],
    Contrast: [
      "border-contrast-5",
      "border-contrast-10",
      "border-contrast-20",
      "border-contrast-30",
      "border-contrast-40",
      "border-contrast-50",
      "border-contrast-60",
      "border-contrast-70",
      "border-contrast-80",
      "border-contrast-90",
      "border-contrast",
    ],
    Primary: ["border-primary", "border-primary-50", "border-primary-10"],
    Error: ["border-error", "border-error-50", "border-error-10"],
    Success: ["border-success", "border-success-50", "border-success-10"],
    Radius: ["rounded-none", "rounded-s", "rounded-m", "rounded-l"],
  },
  "Box Shadow": ["shadow-xs", "shadow-s", "shadow-m", "shadow-l", "shadow-xl"],

  "Flexbox & Grid": {
    "Align Content": [
      "content-center",
      "content-end",
      "content-start",
      "content-around",
      "content-between",
      "content-evenly",
      "content-stretch",
    ],

    "Align Items": [
      "items-baseline",
      "items-center",
      "items-end",
      "items-start",
      "items-stretch",
    ],

    "Align Self": [
      "self-auto",
      "self-baseline",
      "self-center",
      "self-end",
      "self-start",
      "self-stretch",
    ],

    "Justify Content": [
      "justify-center",
      "justify-end",
      "justify-start",
      "justify-around",
      "justify-between",
      "justify-evenly",
    ],

    Flex: ["flex-auto", "flex-none"],

    "Flex Direction": [
      "flex-col",
      "flex-col-reverse",
      "flex-row",
      "flex-row-reverse",
    ],
    "Flex Grow": ["flex-grow-0", "flex-grow"],
    "Flex Shrink": ["flex-shrink-0", "flex-shrink"],
    "Flex Wrap": ["flex-nowrap", "flex-wrap", "flex-wrap-reverse"],

    Gap: {
      Uniform: ["gap-xs", "gap-s", "gap-m", "gap-l", "gap-xl"],
      Column: ["gap-x-xs", "gap-x-s", "gap-x-m", "gap-x-l", "gap-x-xl"],
      Row: ["gap-y-xs", "gap-y-s", "gap-y-m", "gap-y-l", "gap-y-xl"],
    },

    "Grid Columns": [
      "grid-flow-col",
      "grid-flow-row",
      "grid-cols-1",
      "grid-cols-2",
      "grid-cols-3",
      "grid-cols-4",
      "grid-cols-5",
      "grid-cols-6",
      "grid-cols-7",
      "grid-cols-8",
      "grid-cols-9",
      "grid-cols-10",
      "grid-cols-11",
      "grid-cols-12",
    ],
    "Grid Rows": [
      "grid-rows-1",
      "grid-rows-2",
      "grid-rows-3",
      "grid-rows-4",
      "grid-rows-5",
      "grid-rows-6",
    ],
    "Spanning Columns": [
      "col-span-1",
      "col-span-2",
      "col-span-3",
      "col-span-4",
      "col-span-5",
      "col-span-6",
      "col-span-7",
      "col-span-8",
      "col-span-9",
      "col-span-10",
      "col-span-11",
      "col-span-12",
    ],
    "Spanning Rows": [
      "row-span-1",
      "row-span-2",
      "row-span-3",
      "row-span-4",
      "row-span-5",
      "row-span-6",
    ],
  },

  Layout: {
    "Box Sizing": ["box-border", "box-content"],

    Display: [
      "block",
      "flex",
      "hidden",
      "inline",
      "inline-block",
      "inline-flex",
      "inline-grid",
      "grid",
    ],
    Overflow: ["overflow-auto", "overflow-hidden", "overflow-scroll"],

    Position: ["absolute", "fixed", "static", "sticky", "relative"],
  },

  Sizing: {
    Height: [
      "h-0",
      "h-xs",
      "h-s",
      "h-m",
      "h-l",
      "h-xl",
      "h-auto",
      "h-full",
      "h-screen",
    ],

    "Max Height": ["max-h-full", "max-h-screen"],
    "Min Height": ["min-h-0", "min-h-full", "min-h-screen"],
    Width: ["w-xs", "w-s", "w-m", "w-l", "w-xl", "w-auto", "w-full"],
    "Max Width": [
      "max-w-full",
      "max-w-screen-sm",
      "max-w-screen-md",
      "max-w-screen-lg",
      "max-w-screen-xl",
      "max-w-screen-2xl",
    ],

    "Min Width": ["min-w-0", "min-w-full"],

    "Icon Size": ["icon-s", "icon-m", "icon-l"],
  },
  Spacing: {
    Margin: {
      Uniform: ["m-auto", "m-0", "m-xs", "m-s", "m-m", "m-l", "m-xl"],

      Bottom: ["mb-auto", "mb-0", "mb-xs", "mb-s", "mb-m", "mb-l", "mb-xl"],
      Left: ["ml-auto", "ml-0", "ml-xs", "ml-s", "ml-m", "ml-l", "ml-xl"],
      Right: ["mr-auto", "mr-0", "mr-xs", "mr-s", "mr-m", "mr-l", "mr-xl"],
      Top: ["mt-auto", "mt-0", "mt-xs", "mt-s", "mt-m", "mt-l", "mt-xl"],
      "Inline End": [
        "me-auto",
        "me-0",
        "me-xs",
        "me-s",
        "me-m",
        "me-l",
        "me-xl",
      ],
      "Inline Start": [
        "ms-auto",
        "ms-0",
        "ms-xs",
        "ms-s",
        "ms-m",
        "ms-l",
        "ms-xl",
      ],

      Horizontal: ["mx-auto", "mx-0", "mx-xs", "mx-s", "mx-m", "mx-l", "mx-xl"],

      Vertical: ["my-auto", "my-0", "my-xs", "my-s", "my-m", "my-l", "my-xl"],
    },

    Padding: {
      Uniform: ["p-0", "p-xs", "p-s", "p-m", "p-l", "p-xl"],

      Bottom: ["pb-0", "pb-xs", "pb-s", "pb-m", "pb-l", "pb-xl"],

      Left: ["pl-0", "pl-xs", "pl-s", "pl-m", "pl-l", "pl-xl"],

      Right: ["pr-0", "pr-xs", "pr-s", "pr-m", "pr-l", "pr-xl"],

      Top: ["pt-0", "pt-xs", "pt-s", "pt-m", "pt-l", "pt-xl"],

      "Inline End": ["pe-0", "pe-xs", "pe-s", "pe-m", "pe-l", "pe-xl"],
      "Inline Start": ["ps-0", "ps-xs", "ps-s", "ps-m", "ps-l", "ps-xl"],

      Horizontal: ["px-0", "px-xs", "px-s", "px-m", "px-l", "px-xl"],

      Vertical: ["py-0", "py-xs", "py-s", "py-m", "py-l", "py-xl"],
    },
  },

  Typography: {
    "Font Size": [
      "text-2xs",
      "text-xs",
      "text-s",
      "text-m",
      "text-l",
      "text-xl",
      "text-2xl",
      "text-3xl",
    ],

    "Font Weight": [
      "font-thin",
      "font-extralight",
      "font-light",
      "font-normal",
      "font-medium",
      "font-semibold",
      "font-bold",
      "font-extrabold",
      "font-black",
    ],
    "Line Height": ["leading-none", "leading-xs", "leading-s", "leading-m"],

    "List Style Type": ["list-none"],

    "Text Alignment": [
      "text-left",
      "text-center",
      "text-right",
      "text-justify",
    ],

    "Text Color": [
      "text-header",
      "text-body",
      "text-secondary",
      "text-tertiary",
      "text-disabled",
      "text-primary",
      "text-primary-contrast",
      "text-error",
      "text-error-contrast",
      "text-success",
      "text-success-contrast",
    ],

    "Text Overflow": ["overflow-clip", "overflow-ellipsis"],

    "Text Transform": ["capitalize", "lowercase", "uppercase"],

    Whitespace: [
      "whitespace-normal",
      "whitespace-nowrap",
      "whitespace-pre",
      "whitespace-pre-line",
      "whitespace-pre-wrap",
    ],
  },
};
