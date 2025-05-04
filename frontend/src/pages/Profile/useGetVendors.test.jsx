import { describe, test, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import useGetVendors from "./useGetVendors";

describe("useGetVendors", function () {

  test("Fetching two existing vendors and updating states", async function () {

    const mockVendor1 = { ID: 10 }; // Simplified mock vendor
    const mockVendor2 = { ID: 20 }; // Simplified mock vendor

    global.fetch = vi.fn(function () {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ vendors: [mockVendor1, mockVendor2] }),
      })
    });

    const { result } = renderHook(() => useGetVendors());

    expect(result.current[0]).toBe(true); // isLoading
    expect(result.current[1]).toStrictEqual([]); // vendors

    await waitFor(function () {
      expect(result.current[0]).toBe(false); // isLoading
      const vendors = result.current[1];
      expect(vendors[0]).toBe(mockVendor1);
      expect(vendors[1]).toBe(mockVendor2);
    });
  })
})