import type { SequenceItem } from "../types";

/**
 * "This lug nut is harder than your finals." — ~65 s, one night, one deadline.
 * Act 1: 11:52 PM, two attempts gone, eight minutes left. Act 2: the wrong guess (the flats).
 * Act 3: FixtureAI makes them read the callout out loud. Act 4: two edits, submit, pass with four minutes to spare.
 * Feeling: pride.
 */
export const SEQUENCE: SequenceItem[] = [
  { insert: "title", dur: 2.4, title: "11:52 PM", sub: "Night three. Submission closes at midnight." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "tired" },
  { id: "p1", speaker: "person", text: "A lug nut. One part. Two attempts gone, one left.", camera: "personMCU", emotion: "tired" },
  { id: "p2", speaker: "person", text: "And eight minutes.", camera: "personCU", emotion: "tired", gap: 0.35 },
  { id: "b1", speaker: "bot", text: "Forty minutes staring at the same drawing. Tell me what you see.", camera: "peek", mood: "neutral" },
  { id: "p3", speaker: "person", text: "A hexagon with a hole. First-year stuff. How is this failing?", camera: "personMCU", emotion: "skeptical" },

  { insert: "challenge", dur: 2.6, sfx: "whoosh" },

  { id: "p4", speaker: "person", text: "Maybe it's the flats. I'll redo the flats.", camera: "personCU", emotion: "annoyed" },
  { id: "b2", speaker: "bot", text: "The flats are perfect. Stop touching what works.", camera: "botMCU", mood: "neutral" },
  { beat: true, dur: 0.6, camera: "personMCU", focus: "person", emotion: "annoyed" },
  { id: "b3", speaker: "bot", text: "Read the thread callout. Out loud.", camera: "botCU", mood: "neutral" },
  { id: "p5", speaker: "person", text: "M12 by… one point two five.", caption: "M12 × … 1.25.", camera: "personCU", emotion: "surprised" },
  { id: "p6", speaker: "person", text: "Mine is one point five.", caption: "Mine is 1.5.", camera: "personCU", emotion: "surprised", gap: 0.2 },
  { id: "b4", speaker: "bot", text: "And the chamfer is thirty degrees, not forty-five. That's it. Two edits, six minutes.", caption: "And the chamfer is 30°, not 45°. That's it. Two edits, six minutes.", camera: "botMCU", mood: "neutral" },

  { insert: "feedback", dur: 2.8, sfx: "whoosh" },

  { id: "p7", speaker: "person", text: "Two edits.", camera: "personMCU", emotion: "neutral" },
  { id: "b5", speaker: "bot", text: "Go.", camera: "botCU", mood: "happy", gap: 0.3 },
  { beat: true, dur: 0.8, camera: "wide", focus: "person", emotion: "neutral" },
  { id: "p8", speaker: "person", text: "Submitting.", camera: "personCU", emotion: "neutral", sfx: "click", gap: 0.5 },

  { insert: "passed", dur: 2.8, sfx: "chime" },

  { id: "p9", speaker: "person", text: "Passed. On a lug nut. Four minutes to spare.", camera: "personCU", emotion: "smile" },
  { id: "b6", speaker: "bot", text: "On a real part. The kind a company hands you in week one.", camera: "botMCU", mood: "proud" },
  { id: "p10", speaker: "person", text: "Okay. Next one.", camera: "personMCU", emotion: "smile", gap: 0.2 },
  { id: "b7", speaker: "bot", text: "Now you're getting it.", camera: "botCU", mood: "happy", gap: 0.4 },

  { insert: "endcard", dur: 1.6, sfx: "sting" },
  { id: "b8", speaker: "bot", text: "FixtureLabs. Built to make you hireable.", camera: "botCU", mood: "happy", onInsert: true, gap: 0.9 },
];
