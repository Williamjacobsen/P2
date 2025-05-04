import { describe, test, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import useGetProfile from "./useGetProfile";

describe("useGetProfile", function () {

  test("Fetching an existing profile and updating states", async function () {

    const mockProfile = { ID: 10 }; // Simplified mock profile

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ profile: mockProfile }),
      })
    );

    const { result } = renderHook(() => useGetProfile());

    expect(result.current[0]).toBe(true); // isLoading
    expect(result.current[1]).toBeNull(); // profile

    await waitFor(() => {
      expect(result.current[0]).toBe(false); // isLoading
      expect(result.current[1]).toEqual(mockProfile); // profile
    });
  })
})