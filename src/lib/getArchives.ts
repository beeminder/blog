import getPosts, { Post } from "./getPosts";

type Month = {
  label: string;
  posts: Post[];
  post_count: number;
};

type Year = {
  label: number;
  months: Record<number, Month>;
  post_count: number;
};

type Archives = Record<number, Year>;

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

function makeMonth(m: number, posts: Post[]): Month {
  if (!isMonthIndex(m)) throw new Error("Invalid month index");

  const monthPosts = posts.filter((p) => p.date.getMonth() === m);

  return {
    label: MONTH_LABELS[m],
    posts: monthPosts,
    post_count: monthPosts.length,
  };
}

function makeYear(yyyy: number, posts: Post[]): Year {
  const yearPosts = posts.filter((p) => p.date.getFullYear() === yyyy);
  const monthKeys = yearPosts.map((p) => p.date.getMonth());
  return {
    label: yyyy,
    post_count: yearPosts.length,
    months: monthKeys.reduce(
      (acc, k) => ({
        ...acc,
        [k]: makeMonth(k, yearPosts),
      }),
      {}
    ),
  };
}

export default async function getArchives(): Promise<Archives> {
  const posts = await getPosts();
  const yearKeys = posts.map((p) => p.date.getFullYear());
  return yearKeys.reduce(
    (acc, k) => ({
      ...acc,
      [k]: makeYear(k, posts),
    }),
    {}
  );
}
