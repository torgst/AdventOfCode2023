import { handleLines, logJson } from "./helpers";

let sum = 0;
function handleLine(line: string) {
  const data = line.split(":")[1];
  if (!data) throw "No data, something is wrong";
  const winningNumbers = data
    .split("|")[0]
    ?.trim()
    .split(" ")
    .filter((i) => i.trim());
  const myNumbers = data
    .split("|")[1]
    ?.trim()
    .split(" ")
    .filter((i) => i.trim());
  if (!winningNumbers || !myNumbers) {
    throw "Missing some numbers, this should not happen";
  }
  let score = 0;
  const matches: string[] = [];
  for (const winNumber of [...new Set(winningNumbers)]) {
    if (myNumbers.includes(winNumber)) {
      matches.push(winNumber);
      if (score === 0) score = 1;
      else score = score * 2;
    }
  }
  sum += score;
  logJson({ score, sum, matches });
}
handleLines(
  "04-1",
  handleLine,
  //   `
  // Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
  // Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
  // Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
  // Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
  // Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
  // Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
  // `,
);
console.log("Result: " + sum);
