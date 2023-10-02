import type { Reporter } from "vitest/reporters";
import type { Task, File } from "vitest";

// SOURCES:
// https://stackoverflow.com/a/41407246/937377
// https://blog.logrocket.com/using-console-colors-node-js/
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

function logTask(task: Task) {
  switch (task.type) {
    case "test": {
      const state = task.result?.state ?? "undefined";
      const color = state === "fail" ? RED : GREEN;
      return console.log(color, `${state.toUpperCase()}:`, RESET, task.name);
    }
    case "suite":
      return task.tasks.forEach(logTask);
    default:
      throw new Error("unhandled");
  }
}

export default class CustomReporter implements Reporter {
  onFinished(files: File[] = [], errors: unknown[] = []) {
    files.forEach(logTask);
    console.log(`${errors.length} errors`);
  }
}
