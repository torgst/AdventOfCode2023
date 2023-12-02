import { appendFileSync, readFileSync, writeFileSync } from "fs";

const data = readFileSync(`${__dirname}/../data/02-1.txt`, "utf-8");

writeFileSync(`${__dirname}/output.log`, "");
let sum = 0;
for (const line of data.split("\n")) {
  if (!line.trim()) continue;
  const split = line.match(/Game (?<gamenum>\d*):(?<details>.*)/);
  const gamenum = Number.parseInt(split?.groups?.["gamenum"] ?? "");
  const details = split?.groups?.["details"];
  if (isNaN(gamenum) || !details) {
    throw "Couldn't parse gamenum or details, should not happen";
  }
  let minRed = 0;
  let minGreen = 0;
  let minBlue = 0;
  for (const game of details.split(";")) {
    const red = Number.parseInt(game.match(/(\d+)(?: red)/)?.[1] ?? "");
    const green = Number.parseInt(game.match(/(\d+)(?: green)/)?.[1] ?? "");
    const blue = Number.parseInt(game.match(/(\d+)(?: blue)/)?.[1] ?? "");
    if (!isNaN(red) && red > minRed) minRed = red;
    if (!isNaN(green) && green > minGreen) minGreen = green;
    if (!isNaN(blue) && blue > minBlue) minBlue = blue;
  }
  if (minRed === 0 || minGreen === 0 || minBlue === null) {
    throw "One set of cubes has a minimum of zero, not sure how to handle that";
  }
  const power = minRed * minGreen * minBlue;
  sum += power;
  appendFileSync(
    `${__dirname}/output.log`,
    details +
      "\t\t" +
      JSON.stringify({ minRed, minGreen, minBlue, power, sum }) +
      "\n",
  );
}
console.log("Sum of the power of minmum number of cubes: " + sum);
