import { getData, logJson, logString } from "./helpers";

const testData = `
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`;
const data = getData("09-1", undefined);
const lines = data.split("\n");
function getDiffSequences(seq: number[], res: number[][]): number[][] {
  const diffSeq: number[] = [];
  let shouldRecurse = false;
  for (let i = 0; i < seq.length - 1; i++) {
    const diff = seq[i + 1]! - seq[i]!;
    if (diff !== 0) shouldRecurse = true;
    diffSeq.push(diff);
  }
  res.push(diffSeq);
  if (!shouldRecurse || diffSeq.length === 1) return res;
  getDiffSequences(diffSeq, res);
  return res;
}
function getPreviousValue(diffSeqs: number[][]): number {
  logJson(diffSeqs);
  let previousValue: number = 0;
  for (let i = diffSeqs.length - 2; i >= 0; i--) {
    const seq = diffSeqs[i]!;
    const first = seq.slice(0)[0]!;
    previousValue = seq.slice(0)[0]! - previousValue;
    logJson({ seq, first, previousValue });
  }
  logJson({ previousValue });
  return previousValue;
}
let sum = 0;
for (const line of lines) {
  if (!line.trim()) continue;
  const seq = line
    .trim()
    .split(" ")
    .map((v) => +v);
  seq.forEach((v) => {
    if (isNaN(v)) throw "Failed to parse";
  });
  const diffSeqs = getDiffSequences(seq, [seq]);
  sum += getPreviousValue(diffSeqs);
}
logString("Result: " + sum);
