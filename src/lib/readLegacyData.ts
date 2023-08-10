import memoize from "./memoize";
import posts from "../../wp-posts.csv";
import users from "../../wp-users.csv";

const readLegacyData = memoize((): Array<Record<string, unknown>> => {
  return posts.map((post) => ({
    ...post,
    user: users.find((u) => u.ID === post["Author ID"]),
  }));
}, "wpExport");

export default readLegacyData;
