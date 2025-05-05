import React from "react";
import '@testing-library/jest-dom/vitest';
import { describe, test, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import ProfileProductOrders from "./ProfileProductOrders"

describe("ProfileProductOrders", function () {

  test("Fetching two product orders", async function () {

    // Create (simplified) mock data
    const mockProfile = { ID: 10 };
    const mockProfileOrder1 = {
      DateTimeOfPurchase: "0001-01-01T01:01:01.001Z",
    };
    const mockProfileOrder2 = {
      DateTimeOfPurchase: "0002-02-02T02:02:02.002Z",
    };

    // Disregard the "useNavigate" (because it messes with testing)
    vi.mock('react-router-dom', () => ({
      useNavigate: () => vi.fn(),
    }));

    // Create mock fetch requests
    global.fetch = vi.fn((url) => {
      if (url.includes("profile/get")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ profile: mockProfile }),
        })
      } else if (url.includes("productOrder/getProfileProductOrders")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ productOrders: [mockProfileOrder1, mockProfileOrder2] }),
        })
      }
    });

    render(<ProfileProductOrders />);

    screen.getByText(/Loading login/i); // The "/X/i" is a regular expression(RegExp) used to match text in a case-insensitive way.

    await waitFor(function () {
      screen.getByText(/Loading order history/i);
    });

    await waitFor(function () {
      screen.getByRole("heading");
      screen.getByText(/0001-01-01 01:01:01.001/);
      screen.getByText(/0002-02-02 02:02:02.002/);
    });
  })
}) 