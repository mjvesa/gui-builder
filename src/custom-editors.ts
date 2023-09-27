import { vaadinIconEditor } from "./custom-editors/editor/vaadin-icon-editor";
import { vaadinButtonEditor } from "./custom-editors/editor/vaadin-button-editor";
import { vaadinSplitLayoutEditor } from "./custom-editors/editor/vaadin-split-layout-editor";
import { vaadinTabsEditor } from "./custom-editors/editor/vaadin-tabs-editor";
import { vaadinGridEditor } from "./custom-editors/editor/vaadin-grid-editor";
import { vaadinGridColumnEditor } from "./custom-editors/editor/vaadin-grid-column-editor";
import { styleEditor } from "./custom-editors/editor/style-editor";
import { flexboxEditor } from "./custom-editors/editor/flexbox-editor";
import { defaultEditor } from "./custom-editors/editor/default-editor";
import { vaadinUtilityClasses } from "./custom-editors/editor/vaadin-utility-classes";
import { sizesEditor } from "./custom-editors/editor/sizes-editor";
import { fieldEditor } from "./custom-editors/editor/field-editor";

export interface ECAPI {
  style: Record<string, string>;
  props: Record<string, string>;
  repaint: () => void;
}
export const designComponentEditors = [
  ["*", defaultEditor],
  ["*", flexboxEditor],
  ["*", styleEditor],
  ["*", sizesEditor],
  ["*", vaadinUtilityClasses],
  ["vaadin-text-field", fieldEditor],
  ["vaadin-radio-button", fieldEditor],
  ["vaadin-icon", vaadinIconEditor],
  ["iron-icon", vaadinIconEditor],
  ["vaadin-grid", vaadinGridEditor],
  ["vaadin-grid-column", vaadinGridColumnEditor],
  ["vaadin-button", vaadinButtonEditor],
  ["vaadin-split-layout", vaadinSplitLayoutEditor],
  ["vaadin-tabs", vaadinTabsEditor],
];
