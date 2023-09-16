import memoize from "./memoize";
// import posts from "../../wp-posts.csv";
// import users from "../../wp-users.csv";

const readLegacyData = memoize((): Array<Record<string, unknown>> => {
  // console.time("readLegacyData");
  // const data = posts.map((post) => ({
  //   ...post,
  //   user: users.find((u) => u.ID === post["Author ID"]),
  // }));
  // console.timeEnd("readLegacyData");
  // return data;
  return [];
});

export default readLegacyData;
