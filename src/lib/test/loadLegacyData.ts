import { LegacyPostInput, postInput } from "../getLegacyData";
import { vi } from "vitest";
import readLegacyData from "../readLegacyData";
import { generateMock } from "@anatine/zod-mock";

const post = generateMock(postInput);

export default function loadLegacyData(posts: LegacyPostInput[] = []) {
  vi.mocked(readLegacyData).mockReturnValue(
    posts.map((p) => ({
      ...post,
      ...p,
    }))
  );
}
