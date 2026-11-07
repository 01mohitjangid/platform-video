import type { SequenceItem } from "../types";

/**
 * "The hours that count." — ~65 s, a Sunday night and a Wednesday morning.
 * Act 1: 312 hours, forty applications, two replies, both no. Act 2: the one line everyone sends.
 * Act 3: Verified Build Hours replace the line. Act 4: Wednesday, a recruiter spends eleven minutes on it.
 * Feeling: being seen.
 */
export const SEQUENCE: SequenceItem[] = [
  { insert: "title", dur: 2.4, title: "Sunday, 11:30 PM", sub: "Application number forty-one." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "tired" },
  { id: "p1", speaker: "person", text: "Three hundred hours in SolidWorks. And my CV says “proficient”.", caption: "300 hours in SolidWorks. And my CV says “proficient”.", camera: "personMCU", emotion: "tired" },
  { id: "b1", speaker: "bot", text: "Three hundred and twelve. I counted.", caption: "312. I counted.", camera: "peek", mood: "neutral" },
  { id: "p2", speaker: "person", text: "Nobody else did. Forty applications. Two replies. Both no.", camera: "personCU", emotion: "annoyed" },
  { id: "b2", speaker: "bot", text: "What did they read?", camera: "botMCU", mood: "neutral" },
  { id: "p3", speaker: "person", text: "One line. Proficient in SolidWorks. The same line as everyone.", camera: "personMCU", emotion: "tired" },
  { id: "b3", speaker: "bot", text: "Then stop sending the line. Send the hours.", camera: "botCU", mood: "neutral" },
  { id: "p4", speaker: "person", text: "A number isn't proof.", camera: "personCU", emotion: "skeptical" },
  { id: "b4", speaker: "bot", text: "This one is. Open your profile.", camera: "botMCU", mood: "neutral", gap: 0.2 },

  { insert: "hours", dur: 3.4, sfx: "whoosh" },

  { id: "b5", speaker: "bot", text: "Every challenge you passed. Every part, with the feedback. Verified.", camera: "botMCU", mood: "neutral" },
  { id: "p5", speaker: "person", text: "…They can open this?", caption: "… They can open this?", camera: "personMCU", emotion: "surprised" },
  { id: "b6", speaker: "bot", text: "One link. Your work, not your adjectives.", camera: "botCU", mood: "happy" },
  { id: "p6", speaker: "person", text: "Replacing the line.", camera: "personCU", emotion: "neutral", sfx: "click", gap: 0.6 },

  { insert: "title", dur: 2.4, title: "Wednesday, 9:14 AM", sub: "Application forty-one." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "surprised" },
  { id: "p7", speaker: "person", text: "A recruiter opened it. Eleven minutes on the page.", camera: "personMCU", emotion: "surprised" },
  { id: "b7", speaker: "bot", text: "Eleven minutes on you. Not on your CV.", camera: "botMCU", mood: "neutral" },
  { id: "p8", speaker: "person", text: "They want to talk Thursday.", camera: "personCU", emotion: "smile", gap: 0.2 },
  { id: "b8", speaker: "bot", text: "They'll see you.", camera: "botCU", mood: "proud", gap: 0.5 },

  { insert: "endcard", dur: 1.6, sfx: "sting" },
  { id: "b9", speaker: "bot", text: "FixtureLabs. Built to make you hireable.", camera: "botCU", mood: "happy", onInsert: true, gap: 0.9 },
];
