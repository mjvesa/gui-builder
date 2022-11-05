/**
 *  @group unit
 */

import {
  deleteSubtree,
  insertSubtree,
  moveSubtree,
  copySubtree,
  updateSubtreeAttributes,
  POSITION_BEFORE_ELEMENT,
  POSITION_AFTER_ELEMENT,
  POSITION_CHILD_OF_ELEMENT,
} from "../src/model.js";

test("Deleting a subtree", () => {
  const deleted = deleteSubtree(3, ["div", "(", "div", "(", ")", ")"]);
  expect(deleted).toStrictEqual(["div", "(", ")"]);
});

test("Inserting a subtree as a child", () => {
  const inserted = insertSubtree(
    1,
    POSITION_CHILD_OF_ELEMENT,
    ["span", "(", ")"],
    ["div", "(", ")"]
  );
  expect(inserted).toStrictEqual(["div", "(", "span", "(", ")", ")"]);
});

test("Inserting a subtree after element", () => {
  const inserted = insertSubtree(
    1,
    POSITION_AFTER_ELEMENT,
    ["span", "(", ")"],
    ["div", "(", ")"]
  );
  expect(inserted).toStrictEqual(["div", "(", ")", "span", "(", ")"]);
});

test("Inserting a subtree before element", () => {
  const inserted = insertSubtree(
    1,
    POSITION_BEFORE_ELEMENT,
    ["span", "(", ")"],
    ["div", "(", ")"]
  );
  expect(inserted).toStrictEqual(["span", "(", ")", "div", "(", ")"]);
});

test("Move subtree", () => {
  const moved = moveSubtree(4, POSITION_AFTER_ELEMENT, 0, 2, [
    "span",
    "(",
    ")",
    "div",
    "(",
    ")",
  ]);
  expect(moved).toStrictEqual(["div", "(", ")", "span", "(", ")"]);
});

test("Copy subtree", () => {
  const copied = copySubtree(4, ["div", "(", ")", "span", "(", ")"]);
  expect(copied).toStrictEqual(["span", "(", ")"]);
});

test("Update subtree attributes", () => {
  const updated = updateSubtreeAttributes(
    ["textContent", "updated text", "="],
    4,
    ["div", "(", ")", "span", "(", "textContent", "old text", "=", ")"]
  );
  expect(updated).toStrictEqual([
    "div",
    "(",
    ")",
    "span",
    "(",
    "textContent",
    "updated text",
    "=",
    ")",
  ]);
});
