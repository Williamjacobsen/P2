import { useState, useEffect } from "react";

export default function Example() {
  const [inputText, setInputText] = useState("");
  const [savedText, setSavedText] = useState(null);

  // load saved text when on page render
  useEffect(() => {
    const fetchSavedText = async () => {
      try {
        const response = await fetch("http://localhost:3001/example/get-text");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setSavedText(data.text);
        console.log(data.text);
      } catch (error) {
        console.error("Error loading text:", error);
      }
    };

    fetchSavedText();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:3001/example/save-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) throw new Error("Save failed");

      setInputText("");

      await response.json().then((data) => {
        setSavedText(data.text);
      });
    } catch (error) {
      console.error("Error saving text:", error);
    }
  };

  return (
    <div>
      <h4>Send text to backend and save it in database</h4>
      <p>This is your saved text: {savedText || "Loading..."}</p>
      <input
        type="text"
        placeholder="Type shii..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
