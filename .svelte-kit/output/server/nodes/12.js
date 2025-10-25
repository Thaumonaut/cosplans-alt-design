

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/equipment/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/12.KaQIwf7i.js","_app/immutable/chunks/CpdYPIwz.js","_app/immutable/chunks/DQFB0JOk.js","_app/immutable/chunks/BdgeB-LE.js"];
export const stylesheets = ["_app/immutable/assets/vendor-ui.CD54FDqW.css"];
export const fonts = [];
