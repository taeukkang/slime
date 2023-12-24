# slime

shorten links for me

I use this to create memorable short links. Uses Cloudflare Workers to run the code and stores links in Workers KV.

## Getting Started

First, create a new [Cloudflare Workers KV namespace](https://developers.cloudflare.com/kv/get-started/#3-create-a-kv-namespace).

Then, copy the `wrangler.toml.example` file to `wrangler.toml` and replace the `id` under `kv_namespaces` to the ID of the namespace you just created.

To create a new short link, you can add a new key-value pair to the KV namespace you just created. The key should be the short link you want to create, and the value should be the URL you want to redirect to.

Optionally, set up a `PASSWORD` secret to create short links using the web interface, available at `/_slime/create`. Make sure to select "Encrypt" when creating the secret on the [Cloudflare dashboard](https://developers.cloudflare.com/workers/configuration/secrets/#add-secrets-to-your-project).

Finally, run the following commands to start the development server.

```bash
pnpm install
pnpm run dev
```

To deploy, run `pnpm run deploy`.

## License

GPLv3
