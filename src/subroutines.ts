//DONE

import type  { Point } from "./types";

function elt(type, props, ...children) {
  let dom = document.createElement(type);

  if (props) 
   Object.assign(dom, props);

  for (let child of children) {
    if (typeof child != "string")
     dom.appendChild(child);
    else
     dom.appendChild(document.createTextNode(child));
  }

  return dom;
}

function getPointerPosition(p: MouseEvent, domNode: HTMLElement): Point {
  let rect = domNode.getBoundingClientRect();

  return {x: Math.floor((p.clientX - rect.left) / 10), 
          y: Math.floor((p.clientY - rect.top)  / 10)};
}

function getRadius(x: Point, y: Point): number {
  return Math.sqrt(Math.pow(x.x - y.x, 2) + Math.pow(x.y - y.y, 2));
}

function getClassName(target: EventTarget | any) : string {
    return  (target.classList[0]);
}

export {elt, getPointerPosition, getRadius, getClassName};
