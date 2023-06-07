# blog

The
[actual blog](https://blog.beeminder.com "Beeminder blog!")
isn't in GitHub currently (it's hosted by WP Engine) but ideas for new blog posts live here as gissues.
I curate the collection via
[freshgishing](https://www.beeminder.com/d/freshblog "Danny's Beeminder goal for curating the collection of blog post drafts and notes")
aka
[backlog freshening](https://blog.beeminder.com/freshen/ "Nerd version; see also the sequel post").

## Development

```bash
nvm use
pnpm install
pnpm run build
pnpm run preview
pnpm run test
```

There is also a `dev` command with hot reloading. However hot reloading isn't
terribly fast due to the need to pull every post from Etherpad on every build.
So it may be eastier to just run `pnpm run build && pnpm run preview` and refresh
the browser manually.

## Production

Commits merged to `master` are automatically deployed via <render.com>.
