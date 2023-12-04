import { appendFileSync, readFileSync, writeFileSync } from "fs";

const data = readFileSync(`${__dirname}/../data/03-1.txt`, "utf-8");

writeFileSync(`${__dirname}/output.log`, "");
let sum = 0;
for (const line of data.split("\n")) {
  if (!line.trim()) continue;
  appendFileSync(`${__dirname}/output.log`, JSON.stringify({ sum }) + "\n");
}
console.log("Result: " + sum);
