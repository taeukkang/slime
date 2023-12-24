/**
 * slime is a URL shortener
 * https://github.com/taeukkang/slime
 * Taeuk Kang
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	MY_KV_NAMESPACE: KVNamespace;

	// Password to create a new short link. Make sure to "Encrypt" when creating the secret.
	PASSWORD: string;
}

async function noPath(): Promise<Response> {
	const html = `
	<!DOCTYPE html>
	<h1>slime</h1>
	<p>URL shortener powered by <a href="https://github.com/taeukkang/slime">slime</a>. Use it by appending a path to the URL.</p>
	`;

	return new Response(html, {
		headers: {
			'content-type': 'text/html;charset=UTF-8',
		},
	});
}

async function redirect(request: Request, env: Env, pathName: string): Promise<Response> {
	try {
		const value = await env.MY_KV_NAMESPACE.get(pathName);

		if (value === null) {
			return new Response(`Unknown short link: ${pathName}`, { status: 404 });
		}

		return new Response(value, { status: 301, headers: { Location: value } });
	} catch (e: any) {
		return new Response(e.message, { status: 500 });
	}
}

async function create(request: Request, env: Env, pathName: string): Promise<Response> {
	// if GET, return form
	if (request.method === 'GET') {
		const html = `
		<!DOCTYPE html>
		<form method="POST">
			<input name="slug" placeholder="Slug (e.g., my-repo)" />
			<input name="destination" placeholder="Redirect to..." />
			<input type="password" name="password" placeholder="Password" />
			<button>Submit</button>
		</form>`;

		return new Response(html, {
			headers: {
				'content-type': 'text/html;charset=UTF-8',
			},
		});
	}

	// if POST, create short link
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 });
	}

	const formData = await request.formData();
	const slug = formData.get('slug');
	const destination = formData.get('destination');
	const password = formData.get('password');

	if (
		slug === null ||
		slug === '' ||
		destination === null ||
		destination === '' ||
		password === null ||
		password === ''
	) {
		return new Response('Missing required field', { status: 400 });
	}

	// Check password against secret
	if (password !== env.PASSWORD) {
		return new Response('Incorrect password', { status: 401 });
	}

	// Check if slug is available
	try {
		const value = await env.MY_KV_NAMESPACE.get(slug);

		if (value !== null) {
			return new Response('Slug is already in use', { status: 409 });
		}
	} catch (e: any) {
		return new Response(e.message, { status: 500 });
	}

	// Create short link
	try {
		await env.MY_KV_NAMESPACE.put(slug, destination);
	} catch (e: any) {
		return new Response(e.message, { status: 500 });
	}

	return new Response(`Created short link: ${slug} -> ${destination}`, { status: 201 });
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url: URL = new URL(request.url);
		const pathName: string = url.pathname.slice(1);

		switch (pathName) {
			case '':
				return noPath();

			case '_slime':
				const redirectTo = 'https://github.com/taeukkang/slime';

				return new Response(redirectTo, { status: 301, headers: { Location: redirectTo } });

			case '_slime/create':
				return create(request, env, pathName);

			default:
				return redirect(request, env, pathName);
		}
	},
};
