import{a as _,b as g,s as v}from"./vendor-ui.js";import"clsx";import"./environment.js";let y={};function O(t){}function S(t){y=t}let b=null;function U(t){b=t}function q(t){}function k(t){const e=_(t),n=(i,{context:s}={})=>{const a=g(t,{props:i,context:s}),r=Object.defineProperties({},{css:{value:{code:"",map:null}},head:{get:()=>a.head},html:{get:()=>a.body},then:{value:(l,c)=>{{const p=l({css:r.css,head:r.head,html:r.html});return Promise.resolve(p)}}}});return r};return e.render=n,e}function x(t,e){t.component(n=>{let{stores:i,page:s,constructors:a,components:r=[],form:l,data_0:c=null,data_1:p=null,data_2:h=null}=e;v("__svelte__",i),i.page.set(s);const f=a[2];if(a[1]){n.push("<!--[-->");const m=a[0];n.push("<!---->"),m(n,{data:c,form:l,params:s.params,children:o=>{if(a[2]){o.push("<!--[-->");const d=a[1];o.push("<!---->"),d(o,{data:p,form:l,params:s.params,children:u=>{u.push("<!---->"),f(u,{data:h,form:l,params:s.params}),u.push("<!---->")},$$slots:{default:!0}}),o.push("<!---->")}else{o.push("<!--[!-->");const d=a[1];o.push("<!---->"),d(o,{data:p,form:l,params:s.params}),o.push("<!---->")}o.push("<!--]-->")},$$slots:{default:!0}}),n.push("<!---->")}else{n.push("<!--[!-->");const m=a[0];n.push("<!---->"),m(n,{data:c,form:l,params:s.params}),n.push("<!---->")}n.push("<!--]--> "),n.push("<!--[!-->"),n.push("<!--]-->")})}const w=k(x),z={app_template_contains_nonce:!1,async:!1,csp:{mode:"auto",directives:{"script-src":["self"],"upgrade-insecure-requests":!1,"block-all-mixed-content":!1},reportOnly:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1}},csrf_check_origin:!0,csrf_trusted_origins:[],embedded:!1,env_public_prefix:"PUBLIC_",env_private_prefix:"",hash_routing:!1,hooks:null,preload_strategy:"modulepreload",root:w,service_worker:!1,service_worker_options:null,templates:{app:({head:t,body:e,assets:n,nonce:i,env:s})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="description" content="Cosplay project tracking application built with SvelteKit" />
		`+t+`
	</head>
	<body data-sveltekit-preload-data="hover" class="antialiased">
		<div style="display: contents">`+e+`</div>
	</body>
</html>
`,error:({status:t,message:e})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>`+e+`</title>

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
				<h1>`+e+`</h1>
			</div>
		</div>
	</body>
</html>
`},version_hash:"1ui5a64"};async function B(){let t,e,n,i,s;return{handle:t,handleFetch:e,handleError:n,handleValidationError:i,init:s}=await import("./hooks.server.js"),{handle:t,handleFetch:e,handleError:n,handleValidationError:i,init:s,reroute:void 0,transport:void 0}}export{S as a,U as b,q as c,B as g,z as o,y as p,b as r,O as s};
