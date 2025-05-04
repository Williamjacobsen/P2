// Tutorial on testing using Vitest: https://www.youtube.com/watch?v=zuKbR4Q428o

import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app";
import pool from "../db";

describe("End-to-end vendor profile creation, sign out, sign in, modification, and deletion", async function () {
  // NOTE: Fails if an existing user is using the same email or phone number.
  // Temporary test profile information:
  const originalEmail = "the@EmailThatIsBeingTested1";
  const changedEmail = "new@EmailThatIsBeingTested1";
  const password = "thePassword";
  const phoneNumber = "837492758475838"

  let authentificationCookies;
  let testVendor = null;

  test("Create new (vendor) profile", async function () {
    const jsonBody = {
      email: originalEmail,
      password: password,
      phoneNumber: phoneNumber
    }
    const response = await request(app)
      .post("/profile/create")
      .set("Content-Type", "application/json")
      .send(jsonBody);
    expect(response.status).toBe(201);
    authentificationCookies = response.headers["set-cookie"];
    // The .headers["set-cookie"] function gets an array of strings in the format:
    // [
    //    "cookieName=cookieValue; Path=/; HttpOnly; Secure; SameSite=Strict",
    //    "cookie2Name=cookie2Value; Path=/",
    //     And so on...
    // ]
    // Create vendor
    await pool.query(`INSERT INTO p2.Vendor 
      (Name, Address, Email, PhoneNumber, Description, BankAccountNumber, CVR, FAQ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["Test name", "Test address", "Test email", "837492758475839", "Test description", "1010101010", "10101010", "Test FAQ"]);
    const [testVendorRows] = await pool.query(`SELECT * FROM p2.Vendor WHERE Email='Test email' AND PhoneNumber='837492758475839';`)
    expect(Object.keys(testVendorRows).length).toBe(1);
    testVendor = testVendorRows[0];
    // Make profile into a vendor profile
    await pool.query(`UPDATE p2.Profile SET VendorID='${testVendor.ID}' WHERE Email='${originalEmail}';`);
  });

  test("Get vendor", async function () {
    const response = await request(app)
      .get(`/vendor/get?vendorID=${testVendor.ID}`);
    expect(response.status).toBe(200);
    expect(response.body.vendor.ID).toEqual(testVendor.ID);
  });

  test("Get all vendors", async function () {
    const getAllRequest = await request(app)
      .get("/vendor/get-all");
    expect(getAllRequest.status).toBe(200);
    const allVendors = getAllRequest.body.vendors;
    // Since we've already tested "/get", we can use that to
    // verify that the ID's gotten using "/get-all" is are correct.
    // Compare first entry (there will always be at least one, since we have added an entry).
    const getRequest1 = await request(app)
      .get(`/vendor/get?vendorID=${allVendors[0].ID}`);
    expect(allVendors[0].ID).toEqual(getRequest1.body.vendor.ID);
    // Compare second entry (if there is one)
    if (allVendors.length <= 2) {
      const getRequest2 = await request(app)
        .get(`/vendor/get?vendorID=${allVendors[1].ID}`);
      expect(allVendors[1].ID).toEqual(getRequest2.body.vendor.ID);
    }
    // Compare third entry (if there is one)
    if (allVendors.length <= 3) {
      const getRequest3 = await request(app)
        .get(`/vendor/get?vendorID=${allVendors[2].ID}`);
      expect(allVendors[2].ID).toEqual(getRequest3.body.vendor.ID);
    }
  });

  test("Modify vendor (name)", async function () {
    const newName = "a new test name";
    const jsonBody = {
      password: password,
      propertyName: "Name",
      newValue: newName,
    }
    const response = await request(app)
      .put("/vendor/modify")
      .set("Cookie", authentificationCookies)
      .set("Content-Type", "application/json")
      .send(jsonBody);
    expect(response.status).toBe(201);
    // Get vendor
    const response2 = await request(app)
      .get(`/vendor/get?vendorID=${testVendor.ID}`);
    expect(response2.status).toBe(200);
    expect(response2.body.vendor.Name).toEqual(newName);
  });

  test("Get profile product orders", async function () {
    const response = await request(app)
      .get("/productOrder/getProfileProductOrders")
      .set("Cookie", authentificationCookies);
    expect(response.status).toBe(200);
    expect(response.body.productOrders.length).toBe(0);
  });

  test("Sign out", async function () {
    const response1 = await request(app)
      .post("/profile/sign-out-device")
      .set("Cookie", authentificationCookies);
    expect(response1.status).toBe(200);
    // Try (and hopefully fail) to generate a new access token
    const response2 = await request(app)
      .post("/profile/generate-access-token")
      .set("Cookie", authentificationCookies);
    expect(response2.status).toBe(401); // Because refresh token has been deleted
  });

  test("Sign in (wrong password)", async function () {
    const jsonBody = {
      email: originalEmail,
      password: "this is a wrong password"
    }
    const response = await request(app)
      .post("/profile/sign-in")
      .set("Content-Type", "application/json")
      .send(jsonBody);
    expect(response.status).toBe(401);
    authentificationCookies = response.headers['set-cookie'];
  });

  test("Sign in (correct password)", async function () {
    const jsonBody = {
      email: originalEmail,
      password: password
    }
    const response = await request(app)
      .post("/profile/sign-in")
      .set("Content-Type", "application/json")
      .send(jsonBody);
    expect(response.status).toBe(200);
    authentificationCookies = response.headers['set-cookie'];
  });

  test("Generate new access token and use it", async function () {
    const response = await request(app)
      .post("/profile/generate-access-token")
      .set("Cookie", authentificationCookies);
    expect(response.status).toBe(201); // Because refresh token has been deleted
    const newCookies = response.headers['set-cookie'];
    authentificationCookies[1] = newCookies[0];
    // "[1] because the accessToken cookie comes after the refreshToken cookie in the string array pertaining to the cookies.
  });

  test("Get profile (getting email address)", async function () {
    const response = await request(app)
      .get("/profile/get")
      .set("Cookie", authentificationCookies);
    expect(response.status).toBe(200);
    expect(response.body.profile.Email).toBe(originalEmail);
  });

  test("Modify profile (changing email address)", async function () {
    const jsonBody = {
      password: password,
      propertyName: "Email",
      newValue: changedEmail
    }
    const response1 = await request(app)
      .put("/profile/modify")
      .set("Cookie", authentificationCookies)
      .set("Content-Type", "application/json")
      .send(jsonBody);
    expect(response1.status).toBe(201);
    // Get profile and verify that change has happened
    const response2 = await request(app)
      .get("/profile/get")
      .set("Cookie", authentificationCookies);
    expect(response2.status).toBe(200);
    expect(response2.body.profile.Email).toBe(changedEmail);
  });

  test("Delete test vendor", async function () {
    expect(testVendor !== null).toBe(true);
    await pool.query(`DELETE FROM p2.Vendor WHERE ID='${testVendor.ID}';`);
    const [testVendorRows] = await pool.query(`SELECT * FROM p2.Vendor WHERE ID='${testVendor.ID}';`);
    expect(Object.keys(testVendorRows).length).toBe(0);
  });

  test("Delete profile", async function () {
    // Make profile into a non-vendor profile
    await pool.query(`UPDATE p2.Profile SET VendorID=NULL WHERE Email='${changedEmail}';`);
    // Delete
    const jsonBody = {
      password: password
    }
    const response = await request(app)
      .post("/profile/delete")
      .set("Cookie", authentificationCookies)
      .set("Content-Type", "application/json")
      .send(jsonBody);
    expect(response.status).toBe(200);
  });
});
