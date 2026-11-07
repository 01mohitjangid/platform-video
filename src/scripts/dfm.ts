import type { SequenceItem } from "../types";

/**
 * "The bracket that cost four times more." — ~70 s, the night before a design review.
 * Act 1: a bracket they are proud of, fifty grams lighter. Act 2: the DFM review says 4.1× the machining cost.
 * Act 3: three changes, the weight stays. Act 4: the review's first question is the one they can now answer.
 * Feeling: craft.
 */
export const SEQUENCE: SequenceItem[] = [
  { insert: "title", dur: 2.4, title: "Thursday, 10:15 PM", sub: "Design review at nine tomorrow." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "smile" },
  { id: "p1", speaker: "person", text: "Motor mount bracket. Fifty grams lighter than the reference part.", camera: "personMCU", emotion: "smile" },
  { id: "p2", speaker: "person", text: "I'm actually proud of this one.", camera: "personCU", emotion: "smile", gap: 0.3 },
  { id: "b1", speaker: "bot", text: "It's a good model. Now send it to the shop.", camera: "peek", mood: "neutral" },
  { id: "p3", speaker: "person", text: "The DFM check? It's a bracket. Fine.", camera: "personMCU", emotion: "skeptical", sfx: "click", gap: 0.3 },

  { insert: "dfm", dur: 3.4, sfx: "whoosh" },

  { id: "b2", speaker: "bot", text: "Four times the machining cost. That pocket needs a five-axis setup.", caption: "4× the machining cost. That pocket needs a 5-axis setup.", camera: "botMCU", mood: "neutral" },
  { id: "p4", speaker: "person", text: "The pocket is the whole point. That's where the fifty grams came from.", camera: "personCU", emotion: "annoyed" },
  { id: "b3", speaker: "bot", text: "Then open it from the top. Same mass. Three-axis.", caption: "Then open it from the top. Same mass. 3-axis.", camera: "botCU", mood: "neutral" },
  { beat: true, dur: 0.6, camera: "personMCU", focus: "person", emotion: "skeptical" },
  { id: "p5", speaker: "person", text: "…And the corner radii?", caption: "… And the corner radii?", camera: "personMCU", emotion: "neutral" },
  { id: "b4", speaker: "bot", text: "R3. Your end mill has a radius. Real parts do too.", camera: "botMCU", mood: "neutral" },
  { id: "p6", speaker: "person", text: "So three changes.", camera: "personCU", emotion: "neutral" },
  { id: "b5", speaker: "bot", text: "Three changes. The weight stays. The cost doesn't.", camera: "botCU", mood: "happy", gap: 0.4 },

  { insert: "title", dur: 2.4, title: "Friday, 9:40 AM", sub: "Design review." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "smile" },
  { id: "p7", speaker: "person", text: "First question they asked: can we machine this cheaply.", camera: "personMCU", emotion: "smile" },
  { id: "b6", speaker: "bot", text: "And?", camera: "botMCU", mood: "neutral" },
  { id: "p8", speaker: "person", text: "I had the number. One point one.", caption: "I had the number. 1.1×.", camera: "personCU", emotion: "smile", gap: 0.3 },
  { id: "b7", speaker: "bot", text: "That's the difference between a model and a part.", camera: "botCU", mood: "proud", gap: 0.4 },

  { insert: "endcard", dur: 1.6, sfx: "sting" },
  { id: "b8", speaker: "bot", text: "FixtureLabs. Built to make you hireable.", camera: "botCU", mood: "happy", onInsert: true, gap: 0.9 },
];
