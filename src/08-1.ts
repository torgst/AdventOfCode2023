import { getData, logJson, logJsonPretty, logString } from "./helpers";

const data = getData(
  "08-1",
  //   `
  // LLR
  //
  // AAA = (BBB, BBB)
  // BBB = (AAA, ZZZ)
  // ZZZ = (ZZZ, ZZZ)`,
);
const [instructions, mapInput] = data.trim().split("\n\n");
type Pointer = { [point: string]: { L: keyof Pointer; R: keyof Pointer } };
const map: Pointer = {};
mapInput!.split("\n").forEach((line) => {
  const [point, targets] = line.split(" = ");
  if (!targets) throw "Failed to parse";
  const [L, R] = targets?.replace(/\(|\)/g, "").split(", ");
  if (!point || !L || !R) throw "Failed to parse";
  map[point] = { L, R };
});
logJsonPretty(map);
const start = "AAA";
const end = "ZZZ";
let current: keyof Pointer = start;
let stepCount = 0;
while (current !== end) {
  for (const instruction of instructions!.trim().split("")) {
    stepCount++;
    logJson({ current, instruction });
    current = map[current]![instruction as "L" | "R"];
  }
}
logJson({ current });
logString("Result: " + stepCount);
