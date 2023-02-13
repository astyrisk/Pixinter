import { writable } from "svelte/store"
import { Picture } from "./types";

/*move to types.ts */
/* enum for tool */
const TOOLENUM = {
    PEN: 'PEN',
    ERASER: 'ERASER',
    FILL: 'FILL',
    PICKER: 'PICKER',
    CIRCLE: 'CIRCLRE',
    RECT: 'RECT',
} as const;

type ObjectValues<T> = T[keyof T];
type ToolEnum = ObjectValues<typeof TOOLENUM>

/* config type */
interface Config {
    color: string,
    background_color: string,
    tool: ToolEnum,
}

let pictures: Picture[] = []; 


const config = writable<Config>({color: "#000000", background_color: "#E1E3EA", tool: 'PEN'});
const picture =  writable<Picture>(new Picture(90, 60, 10));
const pictureHistory = writable<Picture[]>(pictures);

export { picture, config, pictureHistory, TOOLENUM };
export type { Config, ToolEnum };
//export const config = writable<Config>({color: "#000000", tool: "pen"});
