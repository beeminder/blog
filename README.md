## Blog Post Ideas

Ideas for new blog posts live here as gissues.
Danny curates the collection via
[freshgishing][3] aka
[backlog freshening][4].

## Adding a New Blog Post

Just add the raw source URL to sources.txt in this repository and merge to master!
Merging to master triggers a deploy on Render.com.
You can also click Manual Deploy on the Render.com dashboard.

## Post Markdown

The frontmatter aka metadata for each post is a [YAML][1] block at the very top of the file:

```yaml
--- # nothing above this line
title: The Title of the Post
slug: title-of-post
date: 2021-01-01
author: dreeves
tags: [tag1, tag2]
status: publish # publish or draft or pending
disqus_id: any-unique-string
redirects: [old-slug]
excerpt: >
  The excerpt is used for the post preview on the blog index page.
  It can be multiple lines long.
  All HTML and markdown will be stripped.
---
The actual content of the post goes here.
The usual begin/end-magic strings from etherpad apply.
```

In addition, all Markdown extended features documented at [doc.bmndr.co][2] are supported.

## Development

```bash
nvm use
pnpm install
pnpm run dev
```

Fetch requests are cached to the `.cache` directory during local development.
To clear the cache, run `pnpm run cache:clear`. To disable this behavior, add
`FILE_SYSTEM_CACHE="false"` to a `.env` file in the project root.

### Testing

```bash
pnpm run test
pnpm run test:snapshots
# Once you've verified any snapshot changes are correct, update them with:
pnpm run test:snapshots:update
```

Always err on the side of writing unit tests rather than snapshot
tests. Snapshot tests are unweildy, slow, and brittle. They should
only be used for things that are hard to unit test, For example,
checking that a change doesn't break any posts in the blog's
large backlog would be impractical to do with unit tests. So
we do so with snapshot tests.

Also note that you may need to run `pnpm run cache:clear` to sync
your local cache with any upstream raw source changes. If you
fail to do so and push to GitHub, one or more snapshot tests may
fail as obsolete in GitHub Actions, since each test is identified
by a hash of its source.

## Production

Commits merged to `master` are automatically deployed via Render.com.

## Quick Links

- [ZOMBIES!](https://github.com/beeminder/blog/issues?q=is:open+is:issue+label:ZOM "Open gissues labeled ZOM") :zombie:
  &nbsp;&nbsp; | &nbsp;&nbsp;
  [Undotted i's](https://github.com/beeminder/blog/issues?q=is:issue+is:closed+-label:zap+-label:nix+-label:cnr+-label:dup+-label:pub "Gissues that are closed but don't have any of the resolution labels: zap, nix, cnr, dup, or pub") :eye:
  &nbsp;&nbsp; | &nbsp;&nbsp;
  [Active dev](https://github.com/beeminder/blog/issues?q=is:issue+is:open+label:DEV+-label:ZzZ "Open dev gissues NOT labeled ZzZ") :bug:
  &nbsp;&nbsp; | &nbsp;&nbsp;
  [Snoozed](https://github.com/beeminder/blog/issues?q=is:issue+is:open+label:ZzZ "Open gissues labeled ZzZ") :zzz:
  &nbsp;&nbsp; | &nbsp;&nbsp;
  [Closed dev](https://github.com/beeminder/blog/issues?q=is:issue+is:closed+label:DEV "Closed dev gissues") :heavy_check_mark:
- Freshgishing ([blog post](https://blog.beeminder.com/freshen/ "Backlog Freshening")):
  &nbsp;&nbsp;
  [Bee](https://github.com/beeminder/blog/issues?q=is:issue+is:open+sort:updated-asc+-label:ZzZ+assignee:bsoule "Open non-snoozed gissues, oldest first, assigned to Bethany")
  &nbsp;&nbsp; | &nbsp;&nbsp;
  [Danny/all](https://github.com/beeminder/blog/issues?q=is:issue+is:open+sort:updated-asc+-label:ZzZ "Open non-snoozed gissues, oldest first, assigned to anyone (what Danny uses for freshgishing)")
- [Quickie UVIs](https://github.com/beeminder/blog/issues?q=is:issue+is:open+label:UVI+label:PEA+-label:SKY+-label:ADO "Open + UVI + PEA - SKY - ADO = open peasy non-sky-pie spec'd UVIs") :sweat_smile:

[1]: https://quickref.me/yaml "Standard YAML quick reference"
[2]: http://doc.bmndr.co/ "AKA ExPost"
[3]: https://www.beeminder.com/d/freshblog "Danny's Beeminder goal for curating the collection of blog post drafts and notes"
[4]: https://blog.beeminder.com/freshen/ "Nerd version; see also the sequel post"
