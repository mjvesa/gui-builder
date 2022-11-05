/**
 *  @group unit
 */

import { generateCrudFromBean } from "../src/crud_generator.js";
import { checkModel } from "../src/check-model.js";

test("Generated tree is valid, tiny bean", () => {
  const crud = generateCrudFromBean(tinyBean);
  expect(checkModel(crud)).toEqual(true);
});

test("Generated tree is valid, employee bean", () => {
  const crud = generateCrudFromBean(exampleBean);
  expect(checkModel(crud)).toEqual(true);
});

test("Generated tree has all fields", () => {
  const crud = generateCrudFromBean(exampleBean);
  expect(crud).toEqual(expect.arrayContaining(["label", "Id", "="]));
  expect(crud).toEqual(expect.arrayContaining(["label", "Firstname", "="]));
  expect(crud).toEqual(expect.arrayContaining(["label", "Lastname", "="]));
  expect(crud).toEqual(expect.arrayContaining(["label", "Title", "="]));
  expect(crud).toEqual(expect.arrayContaining(["label", "Email", "="]));
  expect(crud).toEqual(expect.arrayContaining(["label", "Notes", "="]));
});

test("Generated tree contains entity", () => {
  const crud = generateCrudFromBean(exampleBean);
  expect(crud).toEqual(
    expect.arrayContaining(["entity", "com.example.Employee", "="])
  );
});

test("Grid captions are proper JSON", (done) => {
  const crud = generateCrudFromBean(exampleBean);
  const captionsJSON = crud[crud.indexOf("columnCaptions") + 1];
  try {
    JSON.parse(captionsJSON);
    done();
  } catch (e) {
    console.log(e);
  }
});

test("Grid items are proper JSON", (done) => {
  const crud = generateCrudFromBean(exampleBean);
  const itemsJSON = crud[crud.indexOf("items") + 1];
  try {
    JSON.parse(itemsJSON);
    done();
  } catch (e) {
    console.log(e);
  }
});

const tinyBean = `package com.example;

public class Bean {

    private String name;

    public Bean() {
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }
}
`;

const exampleBean = `package com.example;


public class Employee {

    private Long id;
    private String firstname;
    private String lastname;
    private String title;
    private String email;
    private String notes = "";
    private Boolean active;

    public Employee() {
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }


}
`;
