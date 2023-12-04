import { appendFileSync, readFileSync, writeFileSync } from "fs";

const data = readFileSync(`${__dirname}/../data/03-1.txt`, "utf-8");

writeFileSync(`${__dirname}/output.log`, "");
function logJsonPretty(...values: unknown[]) {
  console.log(values);
  appendFileSync(
    `${__dirname}/output.log`,
    JSON.stringify({ ...values }, null, 2) + "\n",
  );
}
function logJson(...values: unknown[]) {
  console.log(values);
  appendFileSync(
    `${__dirname}/output.log`,
    JSON.stringify({ ...values }) + "\n",
  );
}
function logString(value: string) {
  console.log(value);
  appendFileSync(`${__dirname}/output.log`, value + "\n");
}
let sum = 0;
const matrix: string[][] = [];
for (const line of data.split("\n")) {
  if (!line.trim()) continue;
  matrix.push(line.split(""));
}
const dirs = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];
function isGear(value: string): boolean {
  return value === "*";
}
function getPartNumber([i, j]: [number, number]): number {
  let value = matrix[i]![j]!;
  while (!isNaN(Number.parseInt(value))) {
    j--;
    value = matrix[i]![j]!;
  }
  let partId = "";
  j++;
  value = matrix[i]![j]!;
  while (!isNaN(Number.parseInt(value))) {
    partId += value;
    j++;
    value = matrix[i]![j]!;
  }
  const partValue = Number.parseInt(partId);
  if (isNaN(partValue)) {
    throw "partValue is not a number, this should not happen";
  }
  return partValue;
}
function getGearRatio(i: number, j: number): number {
  const partLocations: [number, number][] = [];
  const allPartLocations: [number, number][] = [];
  for (let d = 0; d < dirs.length; d++) {
    const horPos = j + dirs[d]![0]!;
    const verPos = i + dirs[d]![1]!;
    if (horPos < 0 || horPos >= matrix[i]!.length) continue;
    if (verPos < 0 || verPos >= matrix.length) continue;
    const value = matrix[verPos]![horPos]!;
    if (isNaN(Number.parseInt(value))) continue;
    allPartLocations.push([verPos, horPos]);
    if (allPartLocations.find((l) => l[0] === verPos && l[1] === horPos - 1)) {
      continue; // We already located a part number at a position adjacent to this, i.e. this is part of a known part number
    }
    if (allPartLocations.find((l) => l[0] === verPos && l[1] === horPos + 1)) {
      continue; // We already located a part number at a position adjacent to this, i.e. this is part of a known part number
    }
    partLocations.push([verPos, horPos]);
  }
  if (partLocations.length !== 2) return 0;
  const partValue1 = getPartNumber(partLocations[0]!);
  const partValue2 = getPartNumber(partLocations[1]!);
  const ratio = partValue1 * partValue2;
  // logJson({ partValue1, partValue2, ratio });
  return ratio;
}
const visitedGears: boolean[][] = [];
function walkGears() {
  for (let i = 0; i < matrix.length; i++) {
    visitedGears[i] = Array(matrix[i]?.length ?? 0).fill(false);
    if (matrix[i] === undefined) continue;
    for (let j = 0; j < matrix[i]!.length; j++) {
      if (matrix[i]![j] === undefined) continue;
      if (!isGear(matrix[i]![j]!)) continue;
      if (visitedGears[i]![j]!) continue; // We already handled this gear
      visitedGears[i]![j] = true;
      sum += getGearRatio(i, j);
    }
  }
}
walkGears();
console.log("Result: " + sum);
