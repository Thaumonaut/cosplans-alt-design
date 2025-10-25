import{a as _,b as g,s as v}from"./vendor-ui.js";import"clsx";import"./environment.js";let y={};function E(t){}function O(t){y=t}let b=null;function S(t){b=t}function F(t){}function x(t){const s=_(t),n=(l,{context:a}={})=>{const e=g(t,{props:l,context:a}),r=Object.defineProperties({},{css:{value:{code:"",map:null}},head:{get:()=>e.head},html:{get:()=>e.body},then:{value:(i,p)=>{{const c=i({css:r.css,head:r.head,html:r.html});return Promise.resolve(c)}}}});return r};return s.render=n,s}function k(t,s){t.component(n=>{let{stores:l,page:a,constructors:e,components:r=[],form:i,data_0:p=null,data_1:c=null,data_2:u=null}=s;v("__svelte__",l),l.page.set(a);const f=e[2];if(e[1]){n.push("<!--[-->");const d=e[0];n.push("<!---->"),d(n,{data:p,form:i,params:a.params,children:o=>{if(e[2]){o.push("<!--[-->");const m=e[1];o.push("<!---->"),m(o,{data:c,form:i,params:a.params,children:h=>{h.push("<!---->"),f(h,{data:u,form:i,params:a.params}),h.push("<!---->")},$$slots:{default:!0}}),o.push("<!---->")}else{o.push("<!--[!-->");const m=e[1];o.push("<!---->"),m(o,{data:c,form:i,params:a.params}),o.push("<!---->")}o.push("<!--]-->")},$$slots:{default:!0}}),n.push("<!---->")}else{n.push("<!--[!-->");const d=e[0];n.push("<!---->"),d(n,{data:p,form:i,params:a.params}),n.push("<!---->")}n.push("<!--]--> "),n.push("<!--[!-->"),n.push("<!--]-->")})}const w=x(k),U={app_template_contains_nonce:!1,async:!1,csp:{mode:"auto",directives:{"script-src":["self"],"upgrade-insecure-requests":!1,"block-all-mixed-content":!1},reportOnly:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1}},csrf_check_origin:!0,csrf_trusted_origins:[],embedded:!1,env_public_prefix:"PUBLIC_",env_private_prefix:"",hash_routing:!1,hooks:null,preload_strategy:"modulepreload",root:w,service_worker:!1,service_worker_options:null,templates:{app:({head:t,body:s,assets:n,nonce:l,env:a})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="description" content="Cosplay project tracking application built with SvelteKit" />
		`+t+`
	</head>
	<body data-sveltekit-preload-data="hover" class="antialiased">
		<div style="display: contents">`+s+`</div>
	</body>
</html>
`,error:({status:t,message:s})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>`+s+`</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">`+t+`</span>
			<div class="message">
				<h1>`+s+`</h1>
			</div>
		</div>
	</body>
</html>
`},version_hash:"xj6hww"};async function q(){return{handle:void 0,handleFetch:void 0,handleError:void 0,handleValidationError:void 0,init:void 0,reroute:void 0,transport:void 0}}export{O as a,S as b,F as c,q as g,U as o,y as p,b as r,E as s};
