// This webservice is documented at expost.padm.us

// TODO: remove these stubs when we have real implementations
const SmartyPants = (c: string) => c;
const Markdown = (c: string) => c;

export const expost_num: Record<string, number> = {}; // map tag to its number
export const expost_fnt: Record<string, number> = {}; // map tag to number of footnote occurrences for that tag
export const erbchunks: string[] = []; // list of chunks of erb
export const jschunks: string[] = []; // list of chunks of javascript

// ################################################################################
// ################################## FUNCTIONS ###################################
// ################################################################################

// Take the raw content and compute expost_num & expost_fnt hashes.
// Also replace $REF[foo] and $FN[foo] with just $foo.
function preprocess(content: string): string {
  const expost_num: { [tag: string]: number } = {};
  const expost_fnt: { [tag: string]: number } = {};
  let i = 0;
  let j = 0;
  let ret = "";
  for (let x of content.split("\n")) {
    while (true) {
      const m = x.match(/\$(REF|FN)\[([^\]]*)\]/);
      if (!m) break;
      const f = m[1];
      const tag = m[2];
      if (tag && !expost_num[tag]) {
        if (f === "REF") expost_num[tag] = ++i;
        if (f === "FN") expost_num[tag] = ++j;
      }
      if (tag && f === "FN") expost_fnt[tag]++;
      x = x.replace(/\$(REF|FN)\[[^\]]*\]/, `\$${tag}`);
    }
    ret += `${x}\n`;
  }
  for (const k in expost_fnt) {
    const v = expost_fnt[k];
    expost_fnt[k] = (ret.match(new RegExp(`\\$${k}\\b`, "g")) || []).length;
  }
  return ret;
}

// Replace each occurrence of $foo with a number (or a bracketed, hyperlinked
// number in the case of footnotes) based on the hashes computed by preprocess().
function transform(content: string): string {
  let ret = "";
  let fc: Record<string, number> = {};
  content.split("\n").forEach((x) => {
    while (true) {
      let m = x.match(/\$([a-zA-Z]\w*)/);
      if (!m) break;
      let tag = m[1];
      if (!tag || !expost_num[tag]) break;
      if (expost_fnt[tag]) {
        fc[tag] = (fc[tag] || 0) + 1;
        if (fc[tag] !== expost_fnt[tag])
          x = x.replace(
            /\$[a-zA-Z]\w*/,
            `<a id="${tag}${fc[tag]}" href="#${tag}">[$expost_num[tag]]</a>`
          );
        else
          x = x.replace(
            /\$[a-zA-Z]\w*/,
            `<a id="${tag}" href="#${tag}1">[$expost_num[tag]]</a>`
          );
      } else {
        x = x.replace(/\$[a-zA-Z]\w*/, expost_num[tag] + "");
      }
    }
    ret += `${x}\n`;
  });
  return ret;
}

// Replace chunks of erb (<%...%>) with MAGIC_ERB_PLACEHOLDER
function erbstash(content: string): string {
  let tmp = content;
  let i = 0;
  let ret = "";
  while (tmp.match(/^(.*?)\<\%(.*?)\%\>(.*)$/s)) {
    const m = tmp.match(/^(.*?)\<\%(.*?)\%\>(.*)$/s);
    if (!m) continue;
    ret += m[1] + "MAGIC_ERB_PLACEHOLDER";
    erbchunks[i++] = "<%" + m[2] + "%>";
    tmp = m[3] + "";
  }
  return ret + tmp;
}

// Replace MAGIC_ERB_PLACEHOLDER with the stashed chunk of erb
export function erbrestore(content: string): string {
  for (const e of erbchunks) {
    content = content.replace(/MAGIC_ERB_PLACEHOLDER/, e);
  }
  return content;
}

// Replace chunks of javascript (<script>...</script>) with MAGIC_JS_PLACEHOLDER
// (this wouldn't be necessary but for a markdown bug that barfs on the following
// because of the "<bar":
//   <script> var x = 1*2; if(foo<bar) print 2*2; </script>
function jsstash(content: string): string {
  const jschunks: string[] = [];
  let tmp = content;
  let i = 0;
  let ret = "";
  while (tmp.match(/^(.*?)(<script[^>]*>)(.*?)<\/script>(.*)$/s)) {
    const m = tmp.match(/^(.*?)(<script[^>]*>)(.*?)<\/script>(.*)$/s);
    if (m === null) continue;
    ret += m[1] + "MAGIC_JS_PLACEHOLDER";
    jschunks[i++] = `${m[2]}${m[3]}</script>`;
    tmp = m[4] + "";
  }
  return ret + tmp;
}

// Replace MAGIC_JS_PLACEHOLDER with the stashed chunk of javascript
function jsrestore(content: string): string {
  for (const e of jschunks) {
    content = content.replace("MAGIC_JS_PLACEHOLDER", e);
  }
  return content;
}

// ################################################################################
// ############################### TRANSFORMATIONS ################################
// ################################################################################

export default function transformContent(content: string): string {
  // strip out markers like BEGINWC[foo] and ENDWC[foo]
  content = content.replace(/(?:BEGINWC|ENDWC)[[^[]]*]/g, "");

  // fetch the title from the BEGIN_MAGIC[blah blah the title] line
  const match = content.match(/^.*?BEGIN_MAGIC(?:\[([^\[\]]*)\])?/s);
  const title = match?.[1]?.trim();

  // throw out everything before BEGIN_MAGIC
  content = content.replace(/^.*?BEGIN_MAGIC(?:[[^[]]*])?/s, "");

  // throw out everything after END_MAGIC
  content = content.replace(/END_MAGIC.*/s, "");

  // turn ```LANGUAGENAME into ~~~ cuz that's how our markdown engine does codeblox
  content = content.replace(/\n```w*\n/g, "\n~~~\n");

  // do references and footnotes and the actual markdown->html and fancy quotes
  content = jsrestore(
    erbrestore(
      SmartyPants(Markdown(transform(preprocess(erbstash(jsstash(content))))))
    )
  );

  // http://stuff -> <a href="http://stuff">http://stuff</a>
  content = content.replace(
    /([^"'<>])(https?:\/\/[^)\s,.<>]+(?:\.[^)\s,.<>]+)+)/g,
    '$1<a href="$2">$2</a>'
  );

  // turn " -- " into "&thinsp;&mdash;&thinsp;"
  // (oops, caused problems, eg, the following broke:
  //   blah blah -- "thing in quotes" -- blah blah
  // )
  // might be ok if done after markdown/smartpants/etc? trying that now...
  // content = content.replace(/ \-\- /g, '&thinsp;&mdash;&thinsp;');
  content = content.replace(/ &#8212; /g, "&thinsp;&mdash;&thinsp;");

  return content;
}
