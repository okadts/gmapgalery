import type { Writable } from 'svelte/store';
import { localStorageStore } from '@brainandbones/skeleton';

const mapSceneStore: Writable<object> = localStorageStore('mapSceneStore', {});

export default mapSceneStore
