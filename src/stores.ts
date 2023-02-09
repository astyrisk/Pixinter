import { writable } from "svelte/store"

// add Enum for tool
// write a proper config

//interface Config {
//    color: string,
//    background-color: string,
//    tool: string,
//}

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

interface Config {
    color: string,
    background_color: string,
    tool: ToolEnum,
}


const config = writable<Config>({color: "#000000", background_color: "#E1E3EA", tool: 'PEN'})
export {config};
//export const config = writable<Config>({color: "#000000", tool: "pen"});
