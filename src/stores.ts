import { writable } from "svelte/store"
import { Picture } from "./types";
import type { Config } from "./types";

let pictures: Picture[] = []; 

const config = writable<Config>({color: "#000000", background_color: "#E1E3EA", tool: 'PEN'});
const picture =  writable<Picture>(new Picture(90, 60, 10));
const pictureHistory = writable<Picture[]>(pictures);

export { picture, config, pictureHistory };