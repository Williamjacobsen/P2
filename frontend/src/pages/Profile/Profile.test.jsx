import React from "react";
import '@testing-library/jest-dom/vitest';
import { describe, test, expect } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

import Profile from "./Profile"

describe("Profile", function () {

  test("Vendor profile information displays correctly", async function () {

    // Create (simplified) mock data
    const mockProfile = { ID: 10, Email: "profile@email", VendorID: 20 };
    const mockVendor = { ID: 20, Email: "vendor@email", FAQ: "Test test" };

    // Disregard the "useNavigate" (because it messes with testing)
    vi.mock('react-router-dom', () => ({
      useNavigate: () => vi.fn(),
    }));

    // Create mock fetch requests (in the right order)
    global.fetch = vi.fn()
      .mockImplementationOnce(function () { // 1st call (profile)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ profile: mockProfile }),
        })
      })
      .mockImplementationOnce(function () { // 2nd call (vendor)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ vendor: mockVendor }),
        })
      })
      .mockImplementationOnce(function () { // 3rd call
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ vendor: mockVendor }),
        })
      });

    /**
     * Render in act to capture all state updates
     * (so it waits till the loading of the profile and the vendor is finished).
     * I had to do this because of the custom hook useGetVendor having a
     * useEffect() that gets updated when the state of another custom hook
     * useGetProfile gets updated, which I could not get to work using
     * "await waitFor" since it does not trigger the useEffect() when
     * the profile useState gets updated, for some reason.
     */
    await act(async () => {
      render(<Profile />);
    });

    screen.getByText(/profile@email/i); // The "/X/i" is a regular expression(RegExp) used to match text in a case-insensitive way.
    screen.getByText(/vendor@email/i);

    const changeEmailButton = screen.getByRole("button", {
      name: /Change email address/i
    })

    /**
     * I won't test e.g. modifying email address because it is
     * extremely tedious, since it relies on a modal pop up
     * which I cannot figure out how to get a hold of inside
     * this test, since it is not regarded as a part of the 
     * Profile component, or something along those lines.
     * */

  })
}) 