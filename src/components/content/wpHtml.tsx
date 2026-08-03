import parse, {
  attributesToProps,
  Element,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import { createElement, type ReactNode } from "react";

function makeOptions(): HTMLReactParserOptions {
  const options: HTMLReactParserOptions = {
    replace: (node) => {
      if (!(node instanceof Element) || !node.attribs) return undefined;

      const attribs = node.attribs;

      // normalize attributes React expects camelCased; drop event handlers
      for (const key of Object.keys(attribs)) {
        if (/^on[a-z]+$/i.test(key)) {
          delete attribs[key];
        } else if (key === "fetchpriority") {
          attribs.fetchPriority = attribs[key];
          delete attribs[key];
        }
      }

      return undefined;
    },
  };
  return options;
}

export function renderWpHtml(html: string): ReactNode {
  return parse(html || "", makeOptions());
}
