// Tutorial on testing using Vitest: https://www.youtube.com/watch?v=zuKbR4Q428o

import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../server";

describe('GET /vendor', function () {
  // NOTE: Fails if there is no vendor with the ID=1 in the database.
  test('if sending an ID of 1 gets back a vendor with an ID of 1', async function () {
    const response = await request(app)
      .get('/vendor/get?vendorID=1');
    expect(response.status).toBe(200);
    expect(response.body.vendor.ID).toEqual(1);
  });
});

describe('GET /get-all', function () {
  // NOTE: Fails if there are not at least 3 vendors in the database.
  test("if the first 3 vendors have IDs 1, 2, and 3", async function () {
    // Get all vendors
    const getAllReq = await request(app)
      .get('/vendor/get-all');
    expect(getAllReq.status).toBe(200);
    // Since we've already tested "/get", we can use that to
    // verify that the ID's gotten using "/get-all" is are correct.
    // Compare first entry
    const getVendorReq1 = await request(app)
      .get(`/vendor/get?vendorID=${getAllReq.body.vendors[0].ID}`);
    expect(getAllReq.body.vendors[0].ID).toEqual(getVendorReq1.body.vendor.ID);
    // Compare second entry
    const getVendorReq2 = await request(app)
      .get(`/vendor/get?vendorID=${getAllReq.body.vendors[1].ID}`);
    expect(getAllReq.body.vendors[1].ID).toEqual(getVendorReq2.body.vendor.ID);
    // Compare third entry
    const getVendorReq3 = await request(app)
      .get(`/vendor/get?vendorID=${getAllReq.body.vendors[2].ID}`);
    expect(getAllReq.body.vendors[2].ID).toEqual(getVendorReq3.body.vendor.ID);
  });
});



