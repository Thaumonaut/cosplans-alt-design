

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/settings/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.EuP2pqpO.js","_app/immutable/chunks/CpdYPIwz.js","_app/immutable/chunks/DQFB0JOk.js"];
export const stylesheets = ["_app/immutable/assets/vendor-ui.CD54FDqW.css"];
export const fonts = [];
