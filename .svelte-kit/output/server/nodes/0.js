import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BkFImTbd.js","_app/immutable/chunks/CpdYPIwz.js","_app/immutable/chunks/DQFB0JOk.js","_app/immutable/chunks/Ntlovlum.js","_app/immutable/chunks/CWy00aCI.js","_app/immutable/chunks/HoXD5MjQ.js","_app/immutable/chunks/CDFkNZjp.js","_app/immutable/chunks/BdgeB-LE.js","_app/immutable/chunks/B43HCPQ1.js","_app/immutable/chunks/BPMNx3IM.js","_app/immutable/chunks/nuGdgIXB.js","_app/immutable/chunks/CFwePmB6.js","_app/immutable/chunks/M3nupSOH.js","_app/immutable/chunks/Ca-wflxg.js","_app/immutable/chunks/BcRldE91.js","_app/immutable/chunks/BZeYbtOm.js"];
export const stylesheets = ["_app/immutable/assets/vendor-ui.CD54FDqW.css","_app/immutable/assets/0.DltJAe9R.css"];
export const fonts = [];
