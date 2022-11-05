/**
 * @jest-environment jest-environment-webdriver
 *
 * @group selenium
 */

import { exportAllDeclaration } from "@babel/types";

const url = "http://localhost:5000";
let paperShadow;

const openCrudgenAndGetPaperShadow = async () => {
  await browser.get(url);
  await await browser.findElement(by.id("new-design-from-bean")).click();
  const paperShadow = await await browser
    .findElement(by.id("visual-editor"))
    .getProperty("shadowRoot");
  return paperShadow;
};
beforeEach(async () => {
  paperShadow = await openCrudgenAndGetPaperShadow();
});

test("Can enter settigns page", async () => {
  const packageName = await paperShadow
    .findElement(by.id("target-folder"))
    .getAttribute("value");
  expect(packageName).toBe("unide.app");
});

test("Can exit settings page via cancel", async (done) => {
  await await paperShadow.findElement(by.id("settings-cancel")).click();
  try {
    await paperShadow.findElement(by.id("target-folder"));
  } catch (e) {
    done();
  }
});

test("Can exit settings page via save", async (done) => {
  await await paperShadow.findElement(by.id("settings-save")).click();
  try {
    await paperShadow.findElement(by.id("target-folder"));
  } catch (e) {
    done();
  }
});

test("Can set an applayout", async () => {
  // Enter values into the checkbox and textfield
  await await paperShadow.findElement(by.id("use-app-layout")).click();
  await await paperShadow
    .findElement(by.id("app-layout-class"))
    .sendKeys("MyAppLayout");
  await await paperShadow.findElement(by.id("settings-save")).click();

  // Open the page again and check if the values match with stored ones
  const paperShadow2 = await openCrudgenAndGetPaperShadow();
  const useAppLayout = await paperShadow2
    .findElement(by.id("use-app-layout"))
    .getAttribute("checked");
  const myAppLayout = await paperShadow2
    .findElement(by.id("app-layout-class"))
    .getAttribute("value");

  expect(useAppLayout).toBe("true");
  expect(myAppLayout).toBe("MyAppLayout");
});
