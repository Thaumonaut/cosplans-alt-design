import * as universal from '../entries/pages/_layout.ts.js';
import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.Ba_wXYab.js","_app/immutable/chunks/XEHzEZGO.js","_app/immutable/chunks/CZPeboo-.js","_app/immutable/chunks/D7fD82xs.js","_app/immutable/chunks/DQFB0JOk.js","_app/immutable/chunks/DHosTxF_.js","_app/immutable/chunks/Wpo-m7LS.js","_app/immutable/chunks/pRbh3Wg-.js","_app/immutable/chunks/CQnYGsRB.js","_app/immutable/chunks/D_-ADAiY.js","_app/immutable/chunks/D8Pe4E8w.js","_app/immutable/chunks/-ilxgvDN.js","_app/immutable/chunks/BGtp0gUC.js","_app/immutable/chunks/C1IRCzwA.js","_app/immutable/chunks/B8eFzpKg.js","_app/immutable/chunks/qbYtSmtv.js","_app/immutable/chunks/DA3jsQQd.js","_app/immutable/chunks/BZeYbtOm.js"];
export const stylesheets = ["_app/immutable/assets/vendor-ui.CD54FDqW.css","_app/immutable/assets/0.kHPkYLI3.css"];
export const fonts = [];
