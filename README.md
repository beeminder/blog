# blog

## Post Ideas

Ideas for new blog posts live here as gissues. Danny curates the collection via
[freshgishing][3] aka [backlog freshening][4].

## Adding a Post

To add a new post, add its etherpad URL to the `sources.txt` file in this
repository. Once merged to the `master` branch, the post will be automatically
added to the blog. Deployments can be manually triggered via the Render.com
dashboard.

## Post Markdown

The frontmatter for each post is a [YAML][1] block at the top of the file:

```yaml
---
title: The Title of the Post
slug: title-of-post
date: 2021-01-01
author: dreeves
tags: [tag1, tag2]
image:
  src: https://example.com/image.jpg
  alt: alt text
  width: 500
  height: 500
status: publish # or draft or pending
excerpt: >
  The excerpt is used for the post preview on the blog index page.
  It can be multiple lines long.
  All HTML and markdown will be stripped.
---
The actual content of the post goes here.
```

In addition, all Markdown extended features documented [here][2] are supported.

## Development

```bash
nvm use
pnpm install
pnpm run dev
pnpm run test
```

## Production

Commits merged to `master` are automatically deployed via <render.com>.

[1]: https://quickref.me/yaml
[2]: http://expost.padm.us/
[3]: https://www.beeminder.com/d/freshblog "Danny's Beeminder goal for curating the collection of blog post drafts and notes"
[4]: https://blog.beeminder.com/freshen/ "Nerd version; see also the sequel post"
