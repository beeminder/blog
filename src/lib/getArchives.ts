import type { Post } from "../schemas/post";
import getPosts from "./getPosts";
import memoize from "./memoize";

export type Month = {
  label: string;
  posts: Post[];
  post_count: number;
};

type Year = {
  label: number;
  months: Month[];
  post_count: number;
};

type Archives = Year[];

const MONTH_LABELS = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

function isMonthIndex(m: number): m is keyof typeof MONTH_LABELS {
  return m in MONTH_LABELS;
}

function getMonthLabel(m: number): string {
  if (!isMonthIndex(m)) throw new Error("Invalid month index");

  return MONTH_LABELS[m];
}

async function makeArchives(): Promise<Archives> {
  const posts = await getPosts();
  const years = posts.reduce<Archives>((acc, post) => {
    const yyyy = post.date.getFullYear();
    const mm = post.date.getMonth();
    const monthLabel = getMonthLabel(mm);
    const year = acc[yyyy];

    if (year) {
      const month = year.months[mm];

      if (month) {
        month.posts[mm] = post;
        month.post_count++;
      } else {
        year.months[mm] = {
          label: monthLabel,
          posts: [post],
          post_count: 1,
        };
      }

      year.post_count++;
    } else {
      acc[yyyy] = {
        label: yyyy,
        post_count: 1,
        months: [],
      };

      const y = acc[yyyy];

      if (!y) throw new Error("Year not found");

      y.months[mm] = {
        label: monthLabel,
        posts: [post],
        post_count: 1,
      };
    }

    return acc;
  }, []);

  return years.filter((y) => y !== undefined);
}

const getArchives = memoize(makeArchives);

export default getArchives;
