import { writable } from "svelte/store";
import type { Pair } from "./interface";

export const sectionIndex = writable(0);

export const pairs = writable<Pair[]>([]);

export const aliases = writable<{[key: string]: string}>({});