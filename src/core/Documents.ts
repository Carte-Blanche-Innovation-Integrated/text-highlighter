import {MarkerNode} from "./MarkerNode.ts";
import type {JSX} from "react";

export interface TagNodeData {
  tag: keyof JSX.IntrinsicElements;
}

export abstract class BaseDocument {
  abstract text: string;
  abstract tree: MarkerNode<TagNodeData>;

  getText({start, end}: {start: number, end: number}) {
    return this.text.slice(start, end);
  }
}


export class PlainTextDocument extends BaseDocument {
  public tree: MarkerNode<TagNodeData>;

  constructor(public text: string) {
    super();
    this.tree = this.buildTree();
  }

  private buildTree() {
    let start = 0;

    const paragraphs = this.text.split("\n").flatMap((line) => {
      if (!line) {
        start += line.length;
        start += 1;
        return [];
      }

      const node = new MarkerNode<TagNodeData>(
        start,
        start + line.length,
        {tag: 'p'},
      );
      start += line.length;
      start += 1;
      return [node];
    }).filter(Boolean);

    return new MarkerNode<TagNodeData>(
      0,
      this.text.length,
      {tag: 'article'},
      paragraphs,
    );
  }
}