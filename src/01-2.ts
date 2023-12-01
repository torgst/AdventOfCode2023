import { readFileSync } from "fs";

const data = readFileSync(`${__dirname}/../data/01-1.txt`, "utf-8");

function parseNumber(value: string): number | null {
  const parsedInt = Number.parseInt(value);
  if (!isNaN(parsedInt)) return parsedInt;
  if (value === "one") return 1;
  if (value === "two") return 2;
  if (value === "three") return 3;
  if (value === "four") return 4;
  if (value === "five") return 5;
  if (value === "six") return 6;
  if (value === "seven") return 7;
  if (value === "eight") return 8;
  if (value === "nine") return 9;
  return null;
}
let sum: number = 0;
for (const line of data.split("\n")) {
  if (!line.trim()) continue; // empty line
  const matches = Array.from(
    line.matchAll(
      /\d|(?=(one))|(?=(two))|(?=(three))|(?=(four))|(?=(five))|(?=(six))|(?=(seven))|(?=(eight))|(?=(nine))/g,
    ),
    (match) => match.find((m) => m),
  );
  if (matches === null || matches.length === 0) throw "Should not happen";
  const firstNum = parseNumber(matches.slice(0)[0] ?? "");
  const lastNum = parseNumber(matches.slice(-1)[0] ?? "");
  if (firstNum === null || lastNum === null) throw "Should not happen";

  const actualNum = Number.parseInt(`${firstNum}${lastNum}`);
  sum += actualNum;
}
console.log(`Sum of calibration values: ${sum}`);
