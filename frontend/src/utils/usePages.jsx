import { useState } from "react";

/**
 * Used to get the functions and React components needed to set up pages functionality.
 * @returns An object [getVisiblePartOfPageArray, CurrentPageDisplay, PreviousPageButton, NextPageButton],
 * containing the types [function, React component, React component, React component].
 */
export default function usePages(array, elementsPerPage) {
  // Hooks
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  // Functions
  function getVisiblePartOfPageArray() {
    return array.slice((currentPageNumber - 1) * elementsPerPage, currentPageNumber * elementsPerPage);
  };
  // React components
  function CurrentPageDisplay() {
    return (
      <p>
        Page {currentPageNumber} of {Math.ceil(array.length / elementsPerPage)}
      </p>
    )
  }
  function PreviousPageButton({ buttonText = "Previous page" }) {
    return (
      <button onClick={function (event) {
        if (currentPageNumber !== 1) {
          setCurrentPageNumber(currentPageNumber - 1)
        }
      }}>
        {buttonText}
      </button>
    );
  }
  function NextPageButton({ buttonText = "Next page" }) {
    return (
      <button onClick={function (event) {
        if ((currentPageNumber - 1) * elementsPerPage < array.length - elementsPerPage) {
          setCurrentPageNumber(currentPageNumber + 1)
        }
      }}>
        {buttonText}
      </button>
    );
  }
  // Return
  return [getVisiblePartOfPageArray, CurrentPageDisplay, PreviousPageButton, NextPageButton];
}