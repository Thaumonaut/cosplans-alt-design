

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.D8qQMY8P.js","_app/immutable/chunks/CpdYPIwz.js","_app/immutable/chunks/DQFB0JOk.js","_app/immutable/chunks/BdgeB-LE.js"];
export const stylesheets = ["_app/immutable/assets/vendor-ui.CD54FDqW.css"];
export const fonts = [];
