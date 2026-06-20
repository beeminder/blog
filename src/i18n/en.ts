// English UI string catalog for the Beeminder blog chrome.
//
// This is the single home for user-facing copy that lives in the site's
// components, layouts, and pages. Post *content* comes from the CMS via
// posts.json and is intentionally NOT part of this catalog.
//
// The `i18next/no-literal-string` ESLint rule forbids literal user-facing text
// in .astro markup (see eslint.config.js), so new copy must be added here and
// referenced through `strings` from "../i18n". See docs/agents/i18n.md.
//
// Values are either plain strings, functions (for interpolation), or HTML
// fragments rendered with Astro's `set:html` (used where copy contains inline
// links or emphasis). The `set:html` fragments must stay static, hand-authored
// HTML: never interpolate dynamic or user/CMS data into them (set:html is not
// escaped).

export const en = {
  meta: {
    documentTitle: (title: string) => `${title} | Beeminder Blog`,
    rssTitle: "RSS",
    defaultDescription:
      "Beeminder is goal-tracking with teeth. We plot your progress on a graph with a Bright Red Line (formerly Yellow Brick Road). If your datapoints cross that line, we take your money. The Beeminder blog is a hodgepodge of productivity nerdery and behavioral economics written by the founders and various friends.",
  },

  header: {
    beeminderHome: "« Beeminder home",
    blogTitle: "Beeminder Blog",
    emailNotifications: "Email Notifications",
    subscribeRss: "Subscribe by RSS",
    followTwitter: "Follow us on Twitter",
    followFacebook: "Follow us on Facebook",
  },

  // HTML fragment (rendered with set:html): contains links.
  footer: {
    credit: `Blog design by <a href="https://nathanarthur.com">Narthur</a> of <a href="https://pinepeakdigital.com">Pine Peak Digital</a>.`,
  },

  search: {
    placeholder: "Search",
    submit: "Submit search",
  },

  sidebar: {
    aboutHeading: "About",
    // HTML fragments (set:html): contain links / emphasis.
    aboutLede: `<a href="http://beeminder.com">Beeminder</a> is goal-tracking with teeth. We plot your progress on a graph with a Bright Red Line (formerly <i>Yellow Brick Road</i>). If your datapoints cross that line, we take your money.`,
    aboutBlog: `The Beeminder blog is a hodgepodge of productivity nerdery and behavioral economics written by the founders and various friends.`,
    dogfoodHeading: "Eating Our Own Dog Food",
    dogfoodAlt: "dogfood graph",
    dogfoodTitle: "The reason we still have a blog",
    startHereHeading: "Start Here",
    startHere: `Does Beeminder sound super crazypants? Just confusing? One of the first things you may want to check out is our <a href="http://blog.beeminder.com/newbees" title="Also includes a link to our adorable Explain Like I'm 5 video">User's Guide for New Bees</a>. Check out other posts we're most proud of by clicking the "best-of" tag below. If you're a glutton for honey, the "bee-all" tag has everything we still think is worth reading. Other good ones are the "rationality" and "science" tags, if you're into that.`,
    tagsHeading: "Tags",
    moreTags: (count: number) => `...and ${count} more tags`,
    communityHeading: "Beeminder Community",
    community: `Most of the action is in the <a href="http://forum.beeminder.com" title="It's a Discourse.org forum; it's super slick">Beeminder forum</a>. Or if you want to be slightly social without risking getting distracted arguing on the internet, you can do pomodoros online in sync with other Beeminder users and productivity nerds in <a href="https://complice.co/room/beeminder" title="Not to brag but we're close personal friends with the founder of Complice">the Beeminder coworking room on Complice</a>.`,
    akrasiaHeading: "Akrasia",
    akrasiaDefinition: `Akrasia (ancient Greek ἀκρασία, "lacking command over oneself"; adjective: "akratic") is the state of acting against one's better judgment, not doing what one genuinely wants to do. It encompasses procrastination, lack of self-control, lack of follow-through, and any kind of addictive behavior.`,
    akrasiaWikipedia: `<a href="http://en.wikipedia.org/wiki/Akrasia">wikipedia.org/wiki/Akrasia</a>`,
  },

  archives: {
    heading: "Archives",
  },

  recommendedPosts: {
    heading: "Recommended Posts",
    scrollLeft: "Scroll left",
    scrollRight: "Scroll right",
  },

  postMeta: {
    byline: "• by",
  },

  tagsList: {
    label: "Tags:",
  },

  post: {
    commentsDisabledOnDrafts: "Comments are disabled on DRAFT pages.",
  },

  home: {
    title: "Beeminder blog",
  },

  pagination: {
    older: "Older Entries",
    newer: "Newer Entries",
  },

  listing: {
    postCount: (count: number) => `${count} posts`,
    authorTitle: (author: string) => `Author: ${author}`,
    tagTitle: (tag: string) => `Tag: ${tag}`,
    pageTitle: (page: number | string) => `Page ${page}`,
  },

  authors: {
    title: "Authors",
  },

  tagsPage: {
    title: "Tags",
  },

  notFound: {
    title: "404 Not Found!",
    nearMisses: "Sad trombone. Here are things you might've meant:",
  },
};
