// Tutorial on testing using Vitest: https://www.youtube.com/watch?v=zuKbR4Q428o

import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../server";

describe("End-to-end profile creation, sign out, sign in, modification, and deletion", function () {
  // NOTE: Fails if an existing user is using the same email and phone number.
  // Profile information:
  const email = "the@Email";
  const changedEmail = "new@Email";
  const password = "thePassword";
  const phoneNumber = "5555555555"
  // Variables:
  let authentificationCookies;

  test("Create new profile", async function () {
    const jsonBody = {
      email: email,
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

  test("Sign in", async function () {
    const jsonBody = {
      email: email,
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
    expect(response.body.profile.Email).toBe(email);
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
    // Get profile and verify change has happened
    const response2 = await request(app)
      .get("/profile/get")
      .set("Cookie", authentificationCookies);
    expect(response2.status).toBe(200);
    expect(response2.body.profile.Email).toBe(changedEmail);
  });

  test("Delete profile", async function () {
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
