import type { SequenceItem } from "../types";

/**
 * "The interview I bombed." — two nights three weeks apart.
 * Act 1: six hours after freezing on a shaft-in-housing question. Act 2: what they actually said, and where it stopped.
 * Act 3: Interview Studio, same question, 6/10, the fit said out loud, first rushed and then slowly.
 * Act 4: three weeks later, a different company, another fit question.
 * Feeling: second chance.
 *
 * Pacing: voices run at natural speed (TEMPO=1.0). Every voice file carries 0.26 s of padding, so the silence heard
 * after a line is `gap` + 0.26. Long gaps follow the lines that must land (the freeze, "we'll get back to you", the last
 * line); a line is split in two where the speaker stops to think. The rushed answer and the slow answer are the same
 * words on purpose: the only thing that changes is the time they take.
 */
export const SEQUENCE: SequenceItem[] = [
  { insert: "title", dur: 2.4, title: "Tuesday, 11:40 PM", sub: "Six hours after the interview." },
  { beat: true, dur: 0.7, camera: "wide", focus: "person", emotion: "tired" },
  { id: "p1", speaker: "person", text: "One question. A shaft in a housing.", camera: "personMCU", emotion: "tired", gap: 0.25, tone: "Flat, replaying it in their head. A pause between the two sentences." },
  { id: "p1b", speaker: "person", text: "And I just… froze.", caption: "And I just … froze.", camera: "personCU", emotion: "tired", gap: 0.65, tone: "Quiet and ashamed. A real pause before 'froze', and 'froze' is almost a whisper." },
  { id: "p2", speaker: "person", text: "Forty seconds of silence. I counted them on the bus home.", camera: "personMCU", emotion: "tired", gap: 0.55, tone: "Dry and numb. A pause after 'silence'. A bitter half-laugh on 'I counted them'." },
  { id: "b1", speaker: "bot", text: "First real interview?", camera: "peek", mood: "neutral", gap: 0.2, tone: "Soft and careful, a genuine question. Not cheerful." },
  { id: "p3", speaker: "person", text: "The one job I wanted.", camera: "personMCU", emotion: "annoyed", gap: 0.2, tone: "Frustrated with themselves. Low voice." },
  { id: "p3b", speaker: "person", text: "They said, we'll get back to you.", caption: "They said, “We'll get back to you.”", camera: "personCU", emotion: "tired", gap: 0.75, tone: "Flat. A small pause after 'They said', then the polite recruiter phrase, deflated. They know what it means." },
  { id: "b2", speaker: "bot", text: "Tell me what you said. Exactly.", camera: "botMCU", mood: "neutral", gap: 0.25, tone: "Calm and focused, like an engineer starting to debug. A pause before 'Exactly'." },
  { id: "p4", speaker: "person", text: "Datum A on the bore. Datum B on the face.", camera: "personMCU", emotion: "tired", gap: 0.15, tone: "Recalling it step by step, counting it off. Steady." },
  { id: "p4b", speaker: "person", text: "Shaft at twenty… then nothing.", caption: "Shaft at 20 … then nothing.", camera: "personCU", emotion: "tired", gap: 0.65, tone: "Starts sure, trails off after 'twenty', a long pause, then 'then nothing' very quietly." },
  { id: "b3", speaker: "bot", text: "You knew it. The room took it from you.", camera: "botCU", mood: "neutral", gap: 0.35, tone: "Slow, certain and kind. Lean on 'knew'. A pause between the two sentences." },
  { id: "b4", speaker: "bot", text: "So let's take it back. Same question. Now.", camera: "botMCU", mood: "happy", gap: 0.15, tone: "The energy lifts. Three clear phrases. Encouraging, with a little challenge." },

  { insert: "interview", dur: 3.4, sfx: "whoosh" },

  { id: "b5", speaker: "bot", text: "Six out of ten. Datums, strong.", caption: "6 out of 10. Datums, strong.", camera: "botMCU", mood: "neutral", gap: 0.15, tone: "Matter of fact and fair, like reading a result. Not harsh." },
  { id: "b5b", speaker: "bot", text: "You stopped at the fit. Again.", camera: "botCU", mood: "neutral", gap: 0.25, tone: "Gentle but direct. A small pause before 'Again'." },
  { id: "p6", speaker: "person", text: "H seven bore G six shaft clearance fit.", caption: "H7 bore. g6 shaft. Clearance fit.", camera: "personCU", emotion: "annoyed", gap: 0.05, tone: "Very fast and clipped, irritated, blurted out in one breath with no pauses at all, just to get it over with.", rate: 1.3 },
  { id: "b6", speaker: "bot", text: "Slower. Like you have all day.", camera: "botCU", mood: "neutral", gap: 0.15, tone: "Very calm and slow, almost amused. It models the slowness it is asking for." },
  { beat: true, dur: 0.7, camera: "personMCU", focus: "person", emotion: "neutral" },
  { id: "p7", speaker: "person", text: "H seven bore… G six shaft… Clearance fit.", caption: "H7 bore. g6 shaft. Clearance fit.", camera: "personCU", emotion: "neutral", gap: 0.35, tone: "Slow, calm and deliberate. A long thinking pause at each ellipsis. Each part is thought through, steady and sure." },
  { id: "b7", speaker: "bot", text: "There. That's the answer they wanted.", camera: "botMCU", mood: "happy", gap: 0.25, tone: "Warm and satisfied. A pause after 'There.'" },
  { id: "p8", speaker: "person", text: "Again?", camera: "personMCU", emotion: "smile", gap: 0.15, tone: "A small smile, wanting more, a little shy." },
  { id: "b8", speaker: "bot", text: "As many times as you need. Nobody's watching but me.", camera: "botCU", mood: "proud", gap: 0.55, tone: "Kind, low and reassuring. A pause between the two sentences." },

  { insert: "title", dur: 2.4, title: "Three weeks later", sub: "A different company. Another fit question." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "smile" },
  { id: "p9", speaker: "person", text: "A bearing in a housing.", camera: "personCU", emotion: "smile", gap: 0.2, tone: "Holding back a smile, telling the news slowly." },
  { id: "b9", speaker: "bot", text: "And?", camera: "botMCU", mood: "neutral", gap: 0.25, tone: "Curious and patient, leaning in." },
  { id: "p10", speaker: "person", text: "I didn't freeze.", camera: "personMCU", emotion: "smile", gap: 0.25, tone: "Quiet pride. Simple and relieved." },
  { id: "p10b", speaker: "person", text: "I took my time.", camera: "personCU", emotion: "smile", gap: 0.55, tone: "Slow and calm, exactly like the practice. A small smile." },
  { id: "b10", speaker: "bot", text: "You knew it both times.", camera: "botMCU", mood: "proud", gap: 0.25, tone: "Slow, warm and certain." },
  { id: "b10b", speaker: "bot", text: "This time you had the practice.", camera: "botCU", mood: "proud", gap: 0.75, tone: "Proud and steady. The lesson of the whole story. Lean on 'practice'." },

  { insert: "endcard", dur: 1.6, sfx: "sting" },
  { id: "b11", speaker: "bot", text: "FixtureLabs. Built to make you hireable.", camera: "botCU", mood: "happy", onInsert: true, gap: 0.9 },
];
