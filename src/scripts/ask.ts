import type { SequenceItem } from "../types";

/**
 * "Nobody at home is an engineer." — ~70 s, a first-year at 1 AM and the end of the semester.
 * Act 1: everyone in class seems to just know things; nobody at home to ask. Act 2: the question is too basic to say out loud.
 * Act 3: what a datum actually means, in one sentence. Act 4: end of semester, an answer out loud in class.
 * Feeling: permission to ask.
 */
export const SEQUENCE: SequenceItem[] = [
  { insert: "title", dur: 2.4, title: "1:10 AM", sub: "First year. Second semester." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "tired" },
  { id: "p1", speaker: "person", text: "Everyone in my class seems to just… know things.", caption: "Everyone in my class seems to just … know things.", camera: "personMCU", emotion: "tired" },
  { id: "p2", speaker: "person", text: "My dad drives a truck. There's nobody at home to ask.", camera: "personCU", emotion: "tired", gap: 0.4 },
  { id: "b1", speaker: "bot", text: "Then ask me. What is it?", camera: "peek", mood: "neutral" },
  { id: "p3", speaker: "person", text: "It's embarrassing. It's too basic.", camera: "personMCU", emotion: "skeptical" },
  { id: "b2", speaker: "bot", text: "Basic is where everyone started. Nobody remembers to say that.", camera: "botMCU", mood: "neutral" },
  { beat: true, dur: 0.7, camera: "personCU", focus: "person", emotion: "skeptical" },
  { id: "p4", speaker: "person", text: "What does a datum actually mean? I've nodded through four lectures.", camera: "personCU", emotion: "neutral", gap: 0.3 },

  { insert: "ask", dur: 3.6, sfx: "whoosh" },

  { id: "b3", speaker: "bot", text: "It's the surface you agree to measure from. Put the part on a table. The table is datum A.", camera: "botMCU", mood: "neutral" },
  { id: "p5", speaker: "person", text: "…That's it?", caption: "… That's it?", camera: "personMCU", emotion: "surprised" },
  { id: "b4", speaker: "bot", text: "That's it. Everything else is measured from there.", camera: "botCU", mood: "happy" },
  { id: "p6", speaker: "person", text: "Why did nobody say it like that?", camera: "personCU", emotion: "surprised" },
  { id: "b5", speaker: "bot", text: "Ask me the next one. And the one after.", camera: "botMCU", mood: "neutral", gap: 0.4 },

  { insert: "title", dur: 2.4, title: "End of semester", sub: "GD&T lecture, back row." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "smile" },
  { id: "p7", speaker: "person", text: "I answered a question in class today. Out loud.", camera: "personMCU", emotion: "smile" },
  { id: "b6", speaker: "bot", text: "Which one?", camera: "botMCU", mood: "neutral" },
  { id: "p8", speaker: "person", text: "Datums.", camera: "personCU", emotion: "smile", gap: 0.3 },
  { id: "b7", speaker: "bot", text: "Nobody at home is an engineer. Someone at home is about to be.", camera: "botCU", mood: "proud", gap: 0.5 },

  { insert: "endcard", dur: 1.6, sfx: "sting" },
  { id: "b8", speaker: "bot", text: "FixtureLabs. Built to make you hireable.", camera: "botCU", mood: "happy", onInsert: true, gap: 0.9 },
];
