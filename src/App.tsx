import {useEffect, useState} from "react";
import {PlainTextDocument} from "./core/Documents.ts";
import {TextHighlighter} from "./components/TextHighlighter.tsx";


function App() {
  const [textDoc, setTextDoc] = useState<PlainTextDocument>();

  useEffect(() => {
    fetch('/article.txt')
      .then(res => res.text())
      .then((text) => {
        const doc = new PlainTextDocument(text);
        setTextDoc(doc);
        return null
      });
  }, []);

  return (
    <div className="annotator">
      {textDoc && <TextHighlighter doc={textDoc}/>}
    </div>
  )
}

export default App
