import type { SequenceItem } from "../types";

/**
 * "The interview I bombed." — ~70 s, two nights three weeks apart.
 * Act 1: six hours after freezing on tolerance stack-up. Act 2: what they actually said, and where it stopped.
 * Act 3: Interview Studio, same question, 6/10, the fit class said out loud. Act 4: three weeks later, a different company, same question.
 * Feeling: second chance.
 */
export const SEQUENCE: SequenceItem[] = [
  { insert: "title", dur: 2.4, title: "Tuesday, 11:40 PM", sub: "Six hours after the interview." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "tired" },
  { id: "p1", speaker: "person", text: "They asked about tolerance stack-up. And I just… froze.", caption: "They asked about tolerance stack-up. And I just … froze.", camera: "personMCU", emotion: "tired" },
  { id: "p2", speaker: "person", text: "Forty seconds of silence. I counted them on the bus home.", camera: "personCU", emotion: "tired", gap: 0.3 },
  { id: "b1", speaker: "bot", text: "First real interview?", camera: "peek", mood: "neutral" },
  { id: "p3", speaker: "person", text: "The one job I actually wanted.", camera: "personMCU", emotion: "annoyed" },
  { id: "b2", speaker: "bot", text: "Tell me what you said. Exactly.", camera: "botMCU", mood: "neutral" },
  { id: "p4", speaker: "person", text: "Datum A on the bore. Datum B on the face. Shaft at twenty… and then nothing.", caption: "Datum A on the bore. Datum B on the face. Shaft at 20 … and then nothing.", camera: "personCU", emotion: "tired" },
  { id: "b3", speaker: "bot", text: "You knew it. The room took it from you.", camera: "botCU", mood: "neutral" },
  { id: "b4", speaker: "bot", text: "Then let's take it back. Same question. Right now.", camera: "botMCU", mood: "neutral", gap: 0.2 },

  { insert: "interview", dur: 3.4, sfx: "whoosh" },

  { id: "b5", speaker: "bot", text: "Six out of ten. Datums, good. You skipped the fit class. Again.", caption: "6 out of 10. Datums, good. You skipped the fit class. Again.", camera: "botMCU", mood: "neutral" },
  { id: "p6", speaker: "person", text: "H7, g6. Clearance fit. Shaft into housing.", caption: "H7 g6. Clearance fit. Shaft into housing.", camera: "personCU", emotion: "annoyed" },
  { id: "b6", speaker: "bot", text: "Slower. Like you have all day.", camera: "botCU", mood: "neutral" },
  { id: "p7", speaker: "person", text: "H7. g6. Clearance fit. Shaft into housing.", caption: "H7. g6. Clearance fit. Shaft into housing.", camera: "personCU", emotion: "neutral" },
  { id: "b7", speaker: "bot", text: "There. That's the answer they wanted.", camera: "botMCU", mood: "happy" },
  { id: "p8", speaker: "person", text: "Again?", camera: "personMCU", emotion: "smile" },
  { id: "b8", speaker: "bot", text: "As many times as you need. Nobody's watching but me.", camera: "botCU", mood: "proud", gap: 0.5 },

  { insert: "title", dur: 2.4, title: "Three weeks later", sub: "A different company. The same question." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "smile" },
  { id: "p9", speaker: "person", text: "They asked about stack-up.", camera: "personCU", emotion: "smile" },
  { id: "b9", speaker: "bot", text: "And?", camera: "botMCU", mood: "neutral" },
  { id: "p10", speaker: "person", text: "I didn't freeze.", camera: "personMCU", emotion: "smile", gap: 0.3 },
  { id: "b10", speaker: "bot", text: "You never forgot it. You just needed the reps.", camera: "botCU", mood: "proud", gap: 0.4 },

  { insert: "endcard", dur: 1.6, sfx: "sting" },
  { id: "b11", speaker: "bot", text: "FixtureLabs. Built to make you hireable.", camera: "botCU", mood: "happy", onInsert: true, gap: 0.9 },
];
