import { writable } from "svelte/store"

// add Enum for tool

interface Config {
    color: string,
    tool: string,
}

export const config = writable<Config>({color: "#000000", tool: "pen"});
