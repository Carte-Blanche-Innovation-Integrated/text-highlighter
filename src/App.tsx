import {useEffect, useState} from "react";
import {HTMLDocument, PlainTextDocument} from "./core/Documents.ts";
import {TextHighlighter} from "./components/TextHighlighter.tsx";

const domParser = new DOMParser();


function App() {
  const [textDoc, setTextDoc] = useState<PlainTextDocument>();
  const [htmlDoc, setHTMLDoc] = useState<HTMLDocument>();

  useEffect(() => {
    fetch('/article.txt')
      .then(res => res.text())
      .then((text) => {
        const doc = new PlainTextDocument(text);
        setTextDoc(doc);
        return null
      });

    fetch('/article-html')
      .then(res => res.text())
      .then((text) => {
        const parsedhtml = domParser.parseFromString(text, 'text/html');
        console.log(parsedhtml.body);
        const doc = new HTMLDocument(parsedhtml.body);
        setHTMLDoc(doc);
        return null
      });
  }, []);

  return (
    <div className="annotator">
      {/*{textDoc && <TextHighlighter doc={textDoc}/>}*/}
      {htmlDoc && <TextHighlighter doc={htmlDoc}/>}
    </div>
  )
}

export default App
