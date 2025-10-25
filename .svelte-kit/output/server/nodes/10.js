import * as universal from '../entries/pages/characters/_page.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/characters/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/characters/+page.ts";
export const imports = ["_app/immutable/nodes/10.DGYB3LeC.js","_app/immutable/chunks/BZeYbtOm.js","_app/immutable/chunks/CpdYPIwz.js","_app/immutable/chunks/DQFB0JOk.js","_app/immutable/chunks/BdgeB-LE.js","_app/immutable/chunks/mla1rwNA.js","_app/immutable/chunks/BPMNx3IM.js","_app/immutable/chunks/nuGdgIXB.js","_app/immutable/chunks/CFwePmB6.js","_app/immutable/chunks/4jnF_2yx.js","_app/immutable/chunks/DWJWGz81.js"];
export const stylesheets = ["_app/immutable/assets/vendor-ui.CD54FDqW.css"];
export const fonts = [];
