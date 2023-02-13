import { writable  } from "svelte/store";
import type  { Point, Picture } from "./types";

function elt(type, props, ...children) {
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}


function getPointerPosition(p: MouseEvent, domNode: HTMLElement): Point {
    let rect = domNode.getBoundingClientRect();
    return {x: Math.floor((p.clientX - rect.left) / 10), // scale instead of 10
            y: Math.floor((p.clientY - rect.top)  / 10)};
}

let getRadius = (i: Point, j: Point): number  => Math.sqrt(Math.pow(i.x - j.x, 2) + Math.pow(i.y - j.y, 2));

function getColor(p: any, point: Point)  {
    let color: string;
    p.subscribe(n => color = n.getColor(point));
    return color;
}

export {elt, getPointerPosition, getRadius, getColor};
