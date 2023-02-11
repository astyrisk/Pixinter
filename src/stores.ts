import { writable } from "svelte/store"

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


const config = writable<Config>({color: "#000000", background_color: "#E1E3EA", tool: 'PEN'})
export { config, TOOLENUM };
export type { Config, ToolEnum };
//export const config = writable<Config>({color: "#000000", tool: "pen"});
