import React from "react";
import '@testing-library/jest-dom/vitest';
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event"

import Modal from "./Modal"

describe("Modal", function () {

  test("Clicking open button shows custom modal content", async function () {

    const modalContent = (<h1>Test</h1>);
    const openButtonText = "Test open button";
    const closeButtonText = "Test close button";
    render(<Modal
      modalContent={modalContent}
      openButtonText={openButtonText}
      closeButtonText={closeButtonText}
    />
    );

    let heading = screen.queryByRole("heading");
    expect(heading).not.toBeInTheDocument();

    const openButton = screen.getByRole("button");
    expect(openButton).toHaveTextContent(openButtonText);

    const user = userEvent.setup();
    await user.click(openButton);

    heading = screen.queryByRole("heading");
    expect(heading).toBeInTheDocument();
  })
}) 