import { describe, test, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import useGetVendor from "./useGetVendor";

describe("useGetVendor", function () {

  test("Fetching an existing vendor and updating states", async function () {

    const vendorID = 10;
    const mockVendor = { ID: vendorID }; // Simplified mock vendor

    global.fetch = vi.fn(function () {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ vendor: mockVendor }),
      })
    });

    const { result } = renderHook(() => useGetVendor(vendorID));

    expect(result.current[0]).toBe(true); // isLoading
    expect(result.current[1]).toBeNull(); // vendor

    await waitFor(function () {
      expect(result.current[0]).toBe(false); // isLoading
      expect(result.current[1]).toEqual(mockVendor); // vendor
    });
  })
})