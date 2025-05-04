// A tutorial I've taken heavy inspiration from: https://www.youtube.com/watch?v=9DwGahSqcEc

import React, { useState } from "react";

import "./modal.css";

/**
 * Creates a button that when pressed shows a pop up.
 */
export default function Modal({
  modalContent = "X",
  openButtonText = "X",
  closeButtonText = "CLOSE",
}) {
  // Modal visibility
  const [modalVisible, setModalVisibility] = useState(false);
  function toggleModal() {
    setModalVisibility(!modalVisible);
  }

  return (
    <>
      {/* The button which opens the modal */}
      <button onClick={toggleModal} className="modal-open-button">
        {openButtonText}
      </button>
      {/* The modal */}
      {modalVisible && (
        /* This syntax is called "short-circuiting" and functions here as an if-statement */
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            {modalContent}
            <button className="modal-close-button" onClick={toggleModal}>
              {closeButtonText}
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  );
}
