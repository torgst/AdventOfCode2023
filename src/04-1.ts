import { handleLines, logJson } from "./helpers";

let sum = 0;
function handleLine(line: string) {
  logJson({ sum });
}
handleLines(
  "03-1",
  handleLine,
  `
`,
);
console.log("Result: " + sum);
