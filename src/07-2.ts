import { handleLines, logJson, logJsonPretty, logString } from "./helpers";

type HandType =
  | "FiveEqual"
  | "FourEqual"
  | "FullHouse"
  | "ThreeEqual"
  | "TwoPairs"
  | "OnePair"
  | "AllDifferent";
const handTypeOrder: { [hand in HandType]: number } = {
  FiveEqual: 0,
  FourEqual: 1,
  FullHouse: 2,
  ThreeEqual: 3,
  TwoPairs: 4,
  OnePair: 5,
  AllDifferent: 6,
};
function getCardTypeOrder(card: string): number {
  if (!isNaN(+card)) return +card;
  else if (card === "T") return 10;
  else if (card === "J") return 1;
  else if (card === "Q") return 12;
  else if (card === "K") return 13;
  else if (card === "A") return 14;
  else throw "Illegal card";
}
function getHandType(hand: string): HandType {
  const jokerCount = hand.split("").filter((c) => c === "J").length;
  if (hand.match(/(\S)(?:.*\1){4}/)) return "FiveEqual";
  const matchesFourEqual = hand.match(/(\S)(?:.*\1){3}/);
  if (matchesFourEqual) {
    const fourOf = matchesFourEqual[1];
    const check = hand.match(new RegExp(`([^\\s]*(${fourOf}|J)[^\\s]*){3}`));
    if (!check) logJsonPretty({ hand, matchesFourEqual, check });
    logJson({ jokerCount, matchesFourEqual, hand });
    if (jokerCount === 4) return "FiveEqual"; // THIS!!! This fooled me for a few hours!!! @¤#&%;
    return jokerCount >= 1 && fourOf !== "J" ? "FiveEqual" : "FourEqual";
  }
  // Jokercount cannot be above three if there are not four equals...
  const matchesThreeEqual = hand.match(/(\S)(?:.*\1){2}/);
  if (matchesThreeEqual) {
    const threeOf = matchesThreeEqual[1];
    const check = hand.match(new RegExp(`([^\\s]*(${threeOf}|J)[^\\s]*){2}`));
    if (!check) logJsonPretty({ hand, matchesThreeEqual, check });
    if (threeOf === "J") {
      const restMatchesPair = hand.match(/([^\sJ])(?:.*\1){1}/);
      if (restMatchesPair) return "FiveEqual";
      else return "FourEqual";
    } else {
      // JokerCount cannot be more than two if there are not five, four or three J's
      if (jokerCount === 2) return "FiveEqual";
      else if (jokerCount === 1) return "FourEqual";
    }
    // At this stage, there cannot be any J's
    const check2 = hand.match(/J/);
    if (check2) logJsonPretty({ hand, matchesThreeEqual, check2 });
    const restOfHouseRe = new RegExp(`([^\\s${threeOf}])(?:.*\\1){1}`);
    if (hand.match(restOfHouseRe)) return "FullHouse";
    else return "ThreeEqual";
  }
  // There might at most be one or two J's here
  const check2 = hand.match(/J/g);
  if (check2 && check2.length > 2 + 1) {
    logJsonPretty({ hand, check2 });
  }
  const matchesNonJokerPair = hand.match(/([^\sJ])(?:.*\1){1}/);
  if (matchesNonJokerPair) {
    if (jokerCount === 2) return "FourEqual";
    const firstPairCard = matchesNonJokerPair[1];
    const secondPairRe = new RegExp(`([^\\s${firstPairCard}])(?:.*\\1){1}`);
    const matchesSecondPair = hand.match(secondPairRe);
    // logJson({ hand, matchesSecondPair, firstPairCard, jokerCount });
    if (jokerCount === 1 && matchesSecondPair) return "FullHouse";
    else if (jokerCount === 1) return "ThreeEqual";
    // There cannot be any jokers below here
    const check2 = hand.match(/J/);
    if (check2) logJsonPretty({ hand, matchesNonJokerPair, check2 });
    if (matchesSecondPair) return "TwoPairs";
    else return "OnePair";
  }
  logJson({ jokerCount });
  if (jokerCount === 2) return "ThreeEqual";
  else if (jokerCount === 1) return "OnePair";
  else return "AllDifferent";
}
type Game = {
  handType: HandType;
  handOrder: number;
  hand: string;
  sortedHand: string;
  bid: number;
  value?: number;
  index?: number;
};
const games: Game[] = [];
function handleLine(line: string) {
  const [hand, bidStr] = line.split(" ");
  const bid = +(bidStr ?? "");
  if (!hand || isNaN(bid)) throw "Parse failure";
  const sortedHand = hand
    .split("")
    .sort((a, b) => getCardTypeOrder(b) - getCardTypeOrder(a))
    .join("");
  const handType = getHandType(sortedHand);
  const handOrder = handTypeOrder[handType];
  games.push({ handType, handOrder, sortedHand, hand, bid });
}
handleLines(
  "07-1",
  handleLine,
  //   `
  // 2345A 1
  // Q2KJJ 13
  // Q2Q2Q 19
  // T3T3J 17
  // T3Q33 11
  // 2345J 3
  // J345A 2
  // 32T3K 5
  // T55J5 29
  // KK677 7
  // KTJJT 34
  // QQQJA 31
  // JJJJJ 37
  // JAAAA 43
  // AAAAJ 59
  // AAAAA 61
  // 2AAAA 23
  // 2JJJJ 53
  // JJJJ2 41
  // `,
);
function checkHand(game: Game) {
  if (game.handType === "FiveEqual") {
    if (!game.sortedHand.match(/(\S)(\1|J){4}/)) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
  } else if (game.handType === "FourEqual") {
    if (!game.sortedHand.match(/(\S)(.*(\1|J)){3}/)) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
  } else if (game.handType === "ThreeEqual") {
    const match1 = game.sortedHand.match(/(\S)(.*(\1|J)){2}/);
    if (!match1) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
    const firstMatch = match1[1];
    const re = `([^\\s${firstMatch}J])(.*(\\1)){1}`;
    const match2 = game.sortedHand.match(new RegExp(re));
    if (match2) {
      logJsonPretty("ThreeEqual should be house", game, match2, re);
      throw "Fail";
    }
  } else if (game.handType === "FullHouse") {
    const match1 = game.sortedHand.match(/(\S)(.*(\1|J)){2}/);
    if (!match1) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
    const firstMatch = match1[1];
    const match2 = new RegExp(`([^\\s${firstMatch}J])(.*(\\1)){1}`);
    if (!match2) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
  } else if (game.handType === "TwoPairs") {
    const match1 = game.sortedHand.match(/(\S)(.*(\1|J)){1}/);
    if (!match1) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
    const firstMatch = match1[1];
    const match2 = new RegExp(`([^\\s${firstMatch}J])(.*(\\1)){1}`);
    if (!match2) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
  } else if (game.handType === "OnePair") {
    const match1 = game.sortedHand.match(/(\S)(.*(\1|J)){1}/);
    if (!match1) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
  } else if (game.handType === "AllDifferent") {
    const match1 = game.sortedHand.match(/[^\sJ]/);
    if (!match1) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
    let usedChars = match1[0];
    const match2 = game.sortedHand.match(new RegExp(`[^\s${usedChars}J]`));
    if (!match2) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
    usedChars += match2[0];
    const match3 = game.sortedHand.match(new RegExp(`[^\s${usedChars}J]`));
    if (!match3) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
    usedChars += match3[0];
    const match4 = game.sortedHand.match(new RegExp(`[^\s${usedChars}J]`));
    if (!match4) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
    usedChars += match4[0];
    const match5 = game.sortedHand.match(new RegExp(`[^\s${usedChars}J]`));
    if (!match5) {
      logJsonPretty(game.handType, game);
      throw "Fail";
    }
  }
}
games.forEach((g) => checkHand(g));
games.sort((a, b) => {
  const orderDiff = b.handOrder - a.handOrder;
  if (orderDiff !== 0) return orderDiff;
  let i = 0;
  let cardOrderDiff =
    getCardTypeOrder(a.hand.charAt(i)) - getCardTypeOrder(b.hand.charAt(i));
  while (cardOrderDiff === 0 && i < 5) {
    i++;
    cardOrderDiff =
      getCardTypeOrder(a.hand.charAt(i)) - getCardTypeOrder(b.hand.charAt(i));
  }
  return cardOrderDiff;
});
games.forEach((g, i) => {
  g.index = i + 1;
  g.value = g.bid * g.index;
});
games.forEach((g) => logJson(g));
const sum = games.reduce((acc, game, index) => acc + game.bid * (index + 1), 0);
logString("Result: " + sum);
