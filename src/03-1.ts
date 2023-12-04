import { appendFileSync, readFileSync, writeFileSync } from "fs";

const data = readFileSync(`${__dirname}/../data/03-1.txt`, "utf-8");

writeFileSync(`${__dirname}/output.log`, "");
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
function isSymbol(value: string): boolean {
  if (!isNaN(Number.parseInt(value))) return false;
  if (value === ".") return false;
  return true;
}
function endOfPart(curPartId: string, isPartNum: boolean): void {
  if (curPartId !== "") {
    if (isPartNum) {
      const partValue = Number.parseInt(curPartId);
      if (isNaN(partValue)) {
        throw "partValue is not a number, this should not happen";
      }
      sum += partValue;
      console.log(" Sum: " + sum + ", isPartNum: " + curPartId);
    } else {
      console.log(" Sum: " + sum + ", NOT isPartNum: " + curPartId);
    }
    appendFileSync(
      `${__dirname}/output.log`,
      `>>>>> End of partId: ${curPartId} (isPartNum: ${isPartNum})\n`,
    );
  }
}
let curPartId = "";
let isPartNum = false;
for (let i = 0; i < matrix.length; i++) {
  if (matrix[i] === undefined) continue;
  endOfPart(curPartId, isPartNum);
  curPartId = "";
  isPartNum = false;
  appendFileSync(
    `${__dirname}/output.log`,
    "---------------------------------------------\n",
  );
  for (let j = 0; j < matrix[i]!.length; j++) {
    if (matrix[i]![j] === undefined) continue;
    const current = Number.parseInt(matrix[i]![j]!);
    if (isNaN(current)) {
      endOfPart(curPartId, isPartNum);
      curPartId = "";
      isPartNum = false;
      continue;
    }
    curPartId += current;
    // appendFileSync(
    //   `${__dirname}/output.log`,
    //   `----- New character: ${matrix[i]![j]!} at [${i},${j}].\n`,
    // );
    for (let d = 0; d < dirs.length; d++) {
      const horPos = j + dirs[d]![0]!;
      const verPos = i + dirs[d]![1]!;
      if (horPos < 0 || horPos >= matrix[i]!.length) continue;
      if (verPos < 0 || verPos >= matrix.length) continue;
      if (isSymbol(matrix[verPos]![horPos]!)) isPartNum = true;
      // appendFileSync(
      //   `${__dirname}/output.log`,
      //   //JSON.stringify({ matrix }, null, 2) + "\n",
      //   `Checking: ${matrix[verPos]![
      //     horPos
      //   ]!} at [${verPos},${horPos}]. isPartNum: ${isPartNum}\n`,
      // );
    }
  }
}
console.log("Result: " + sum);
