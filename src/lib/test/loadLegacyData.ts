import { vi } from "vitest";
import readLegacyData from "../readLegacyData";
import { generateMock } from "@anatine/zod-mock";
import {
  type LegacyPostInput,
  legacyPostInput,
} from "../../schemas/legacyPost";

const post = generateMock(legacyPostInput);

export default function loadLegacyData(posts: LegacyPostInput[] = []) {
  vi.mocked(readLegacyData).mockReturnValue(
    posts.map((p) => ({
      ...post,
      ...p,
    })),
  );
}
