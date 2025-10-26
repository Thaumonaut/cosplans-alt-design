import * as universal from '../entries/pages/dashboard/_page.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/dashboard/+page.ts";
export const imports = ["_app/immutable/nodes/12.CnHrPDYz.js","_app/immutable/chunks/BZeYbtOm.js","_app/immutable/chunks/D7fD82xs.js","_app/immutable/chunks/DQFB0JOk.js","_app/immutable/chunks/7UemBMGl.js","_app/immutable/chunks/D_-ADAiY.js","_app/immutable/chunks/B9G0ID8B.js","_app/immutable/chunks/CgUVsadB.js","_app/immutable/chunks/AFI0j-x2.js","_app/immutable/chunks/DA-hWYmQ.js","_app/immutable/chunks/Bt71eeJH.js","_app/immutable/chunks/CQxq7Zdh.js","_app/immutable/chunks/ALVDnPgZ.js","_app/immutable/chunks/Dz58FcrU.js","_app/immutable/chunks/DA3jsQQd.js","_app/immutable/chunks/CQnYGsRB.js","_app/immutable/chunks/DqT8nK3I.js"];
export const stylesheets = ["_app/immutable/assets/vendor-ui.CD54FDqW.css"];
export const fonts = [];
