import { readFileSync } from "fs";

const data = readFileSync(`${__dirname}/../data/01-1.txt`, "utf-8");

let sum: number = 0;
for (const line of data.split("\n")) {
  if (!line.trim()) continue; // empty line
  let firstNum: number | null = null;
  let lastNum: number | null = null;
  for (const char of line.split("")) {
    const num = Number.parseInt(char);
    if (isNaN(num)) continue;
    if (firstNum === null) firstNum = num;
    lastNum = num;
  }
  if (firstNum === null || lastNum === null) {
    throw "Should not happen";
  }
  const actualNum = Number.parseInt(`${firstNum}${lastNum}`);
  sum += actualNum;
}
console.log(`Sum of calibration values: ${sum}`);
