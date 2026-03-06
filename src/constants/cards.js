export const SUITS = ["♠", "♥", "♦", "♣"];
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const isRed = (suit) => suit === "♥" || suit === "♦";
export function createDeck(numDecks = 1) {
  const deck = [];
  for (let i = 0; i < numDecks; i++)
    for (const suit of SUITS)
      for (const rank of RANKS)
        deck.push({ suit, rank });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
export const cardVal = (c) => { if (["J","Q","K"].includes(c.rank)) return 10; if (c.rank === "A") return 11; return parseInt(c.rank); };
export const rankNum = (r) => ({ "A":14,"K":13,"Q":12,"J":11,"10":10,"9":9,"8":8,"7":7,"6":6,"5":5,"4":4,"3":3,"2":2 }[r]);
