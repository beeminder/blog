import type { Reporter } from "vitest/reporters";
import type { Task, File } from "vitest";

// SOURCE: https://stackoverflow.com/a/41407246/937377
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";

function logSomthing(thing: Task) {
  const { type } = thing;
  switch (type) {
    case "test": {
      const state = thing.result?.state || "undefined";
      const message = `${state.toUpperCase()}: ${thing.name}`;
      const color = state === "fail" ? RED : GREEN;
      // return state === "fail" ? console.error(message) : console.log(message);
      return console.log(color, message);
    }
    case "suite":
      return thing.tasks.forEach(logSomthing);
    case "custom":
      return console.log("custom");
    default:
      throw new Error("unreachable");
  }
}

export default class CustomReporter implements Reporter {
  onFinished(files: File[] | undefined, errors: unknown[] | undefined) {
    // throw new Error("test");
    files?.forEach(logSomthing);
    const hasErrors = errors && errors.length;

    console.log(`${hasErrors ? errors.length : "No"} errors`);
  }
}
