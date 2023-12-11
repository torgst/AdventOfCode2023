import { getData, logJson, logJsonPretty, logString } from "./helpers";

const data = getData(
  "08-1",
  //   `
  // LR
  //
  // 11A = (11B, XXX)
  // 11B = (XXX, 11Z)
  // 11Z = (11B, XXX)
  // 22A = (22B, XXX)
  // 22B = (22C, 22C)
  // 22C = (22Z, 22Z)
  // 22Z = (22B, 22B)
  // XXX = (XXX, XXX)
  // `,
);
const [instructions, mapInput] = data.trim().split("\n\n");
type Pointer = { [point: string]: { L: PointerKey; R: PointerKey } };
type PointerKey = keyof Pointer & string;
const map: Pointer = {};

const startNodes: PointerKey[] = [];
const endNodes: PointerKey[] = [];
mapInput!.split("\n").forEach((line) => {
  const [point, targets] = line.split(" = ");
  if (!targets) throw "Failed to parse";
  const [L, R] = targets?.replace(/\(|\)/g, "").split(", ");
  if (!point || !L || !R) throw "Failed to parse";
  map[point] = { L, R };
  if (point.charAt(2) === "A") startNodes.push(point);
  else if (point.charAt(2) === "Z") endNodes.push(point);
});
logJsonPretty(map);
logJsonPretty(startNodes);
logJsonPretty(endNodes);
let currentNodes: PointerKey[] = startNodes;
let stepCount = 0;
function reachedEnd(): boolean {
  return !currentNodes.find((n) => n.charAt(2) !== "Z");
}
while (!reachedEnd()) {
  for (const instruction of instructions!.trim().split("")) {
    stepCount++;
    if (stepCount % (1000 * 1000) === 0) process.stdout.write(".");
    // logJson({ currentNodes, instruction });
    for (let i = 0; i < currentNodes.length; i++) {
      currentNodes[i] = map[currentNodes[i]!]![instruction as "L" | "R"];
    }
  }
}
logJson({ currentNodes });
logString("Result: " + stepCount);
