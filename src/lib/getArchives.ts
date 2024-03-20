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

  posts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA > dateB) return 1;
    if (dateA < dateB) return -1;

    return 0;
  });

  const yearMonths = posts.reduce<Record<number, Record<number, Post[]>>>(
    (acc, post) => {
      const year = post.date.getFullYear();
      const month = post.date.getMonth();

      if (!acc[year]) {
        acc[year] = {};
      }

      if (!acc[year]![month]) {
        acc[year]![month] = [];
      }

      acc[year]![month]!.push(post);

      return acc;
    },
    {},
  );

  const years = Object.entries(yearMonths).map(([year, months]) => {
    const monthsArray = Object.entries(months).map(([month, posts]) => {
      return {
        label: getMonthLabel(Number(month)),
        posts,
        post_count: posts.length,
      };
    });

    return {
      label: Number(year),
      months: monthsArray,
      post_count: monthsArray.reduce((acc, month) => {
        return acc + month.post_count;
      }, 0),
    };
  });

  return years;
}

const getArchives = memoize(makeArchives);

export default getArchives;
