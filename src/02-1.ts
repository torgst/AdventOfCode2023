import { appendFileSync, readFileSync, writeFileSync } from "fs";

const data = readFileSync(`${__dirname}/../data/02-1.txt`, "utf-8");

writeFileSync(`${__dirname}/output.log`, "");
const maxRed = 12;
const maxGreen = 13;
const maxBlue = 14;
let sum = 0;
for (const line of data.split("\n")) {
  if (!line.trim()) continue;
  const split = line.match(/Game (?<gamenum>\d*):(?<details>.*)/);
  const gamenum = Number.parseInt(split?.groups?.["gamenum"] ?? "");
  const details = split?.groups?.["details"];
  if (isNaN(gamenum) || !details) {
    throw "Couldn't parse gamenum or details, should not happen";
  }
  let gamePossible = true;
  for (const game of details.split(";")) {
    const red = Number.parseInt(game.match(/(\d+)(?: red)/)?.[1] ?? "");
    const green = Number.parseInt(game.match(/(\d+)(?: green)/)?.[1] ?? "");
    const blue = Number.parseInt(game.match(/(\d+)(?: blue)/)?.[1] ?? "");
    if (!isNaN(red) && red > maxRed) gamePossible = false;
    if (!isNaN(green) && green > maxGreen) gamePossible = false;
    if (!isNaN(blue) && blue > maxBlue) gamePossible = false;
  }
  if (gamePossible) sum += gamenum;
  appendFileSync(
    `${__dirname}/output.log`,
    details + "\t\t" + JSON.stringify({ gamePossible, sum }) + "\n",
  );
}
console.log("Sum of the ID of possible games: " + sum);
