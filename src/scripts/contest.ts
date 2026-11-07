import type { SequenceItem } from "../types";

/**
 * "The contest I almost skipped." — ~70 s, one Sunday evening.
 * Act 1: two minutes to the Sunday Sprint, 412 people, the urge to just watch. Act 2: one problem, that's the deal.
 * Act 3: the room is full of things they have already done; the rank climbs. Act 4: rank 47, two minutes left.
 * Feeling: belonging.
 */
export const SEQUENCE: SequenceItem[] = [
  { insert: "title", dur: 2.4, title: "Sunday, 6:58 PM", sub: "Two minutes to the Sunday Sprint." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "tired" },
  { id: "p1", speaker: "person", text: "Four hundred people in the room. Half of them from IITs.", camera: "personMCU", emotion: "tired" },
  { id: "p2", speaker: "person", text: "I'm going to be last. Publicly.", camera: "personCU", emotion: "skeptical", gap: 0.3 },
  { id: "b1", speaker: "bot", text: "Last is a rank. Not entering is a zero.", camera: "peek", mood: "neutral" },
  { id: "p3", speaker: "person", text: "I'll just watch the leaderboard this week.", camera: "personMCU", emotion: "annoyed" },
  { id: "b2", speaker: "bot", text: "Press start. One problem. That's the deal.", camera: "botMCU", mood: "neutral" },
  { beat: true, dur: 0.7, camera: "personCU", focus: "person", emotion: "skeptical" },
  { id: "p4", speaker: "person", text: "One problem.", camera: "personCU", emotion: "neutral", sfx: "click", gap: 0.4 },

  { insert: "title", dur: 2.2, title: "7:46 PM", sub: "Forty-one minutes left." },
  { id: "p5", speaker: "person", text: "Wait. Problem two is the shaft and housing fit. I did that last week.", camera: "personMCU", emotion: "surprised" },
  { id: "b3", speaker: "bot", text: "Everything in this room is something you've already done.", camera: "botCU", mood: "neutral", gap: 0.2 },

  { insert: "contest", dur: 3.4, sfx: "whoosh" },

  { id: "b4", speaker: "bot", text: "Two of four. Rank eighty-eight, and climbing.", caption: "Two of four. Rank 88, and climbing.", camera: "botMCU", mood: "happy" },
  { id: "p6", speaker: "person", text: "Eighty-eight out of four hundred.", caption: "88 out of 400.", camera: "personCU", emotion: "surprised" },
  { id: "b5", speaker: "bot", text: "Four hundred and twelve. Problem three. Go.", caption: "412. Problem three. Go.", camera: "botCU", mood: "neutral", gap: 0.3 },

  { insert: "title", dur: 2.2, title: "8:28 PM", sub: "Two minutes left." },
  { id: "p7", speaker: "person", text: "Three of four. Rank… forty-seven.", caption: "Three of four. Rank … 47.", camera: "personCU", emotion: "smile" },
  { id: "b6", speaker: "bot", text: "Forty-seventh. In a room you were going to watch from outside.", caption: "47th. In a room you were going to watch from outside.", camera: "botMCU", mood: "proud" },
  { id: "p8", speaker: "person", text: "I almost skipped it.", camera: "personMCU", emotion: "smile", gap: 0.3 },
  { id: "b7", speaker: "bot", text: "Next Sunday, you won't.", camera: "botCU", mood: "happy", gap: 0.4 },

  { insert: "endcard", dur: 1.6, sfx: "sting" },
  { id: "b8", speaker: "bot", text: "FixtureLabs. Built to make you hireable.", camera: "botCU", mood: "happy", onInsert: true, gap: 0.9 },
];
