import type { SequenceItem } from "../types";

/**
 * "Nobody at home is an engineer." — a second-year at 1 AM and the end of the semester.
 * Act 1: everyone in class seems to just know things; nobody at home to ask. Act 2: the question is too basic to say out loud.
 * Act 3: what a datum actually means, in one sentence. Act 4: end of semester, an answer out loud in class, and someone asks them.
 * Feeling: permission to ask.
 *
 * Pacing: voices run at natural speed (TEMPO=1.0). Every voice file carries 0.26 s of padding, so the silence heard
 * after a line is `gap` + 0.26. Long gaps follow the lines that must land (the fear, the definition, the last line);
 * a line is split in two where the speaker stops to think, and silent beats sit where a thought is forming.
 */
export const SEQUENCE: SequenceItem[] = [
  { insert: "title", dur: 2.4, title: "1:10 AM", sub: "Second year. Third semester." },
  { beat: true, dur: 0.7, camera: "wide", focus: "person", emotion: "tired" },
  { id: "p1", speaker: "person", text: "Everyone in my class seems to just… know things.", caption: "Everyone in my class seems to just … know things.", camera: "personMCU", emotion: "tired", gap: 0.45, tone: "Quiet, to themselves, late at night. Unhurried. A small pause before 'know things'. Tired, not dramatic." },
  { id: "p2", speaker: "person", text: "My dad drives a truck.", camera: "personCU", emotion: "tired", gap: 0.25, tone: "A plain fact, said with quiet respect, never shame. Calm and even." },
  { id: "p2b", speaker: "person", text: "There's nobody at home I can ask.", camera: "personCU", emotion: "tired", gap: 0.75, tone: "Softer and slower. This is the real worry. Let the last word fall away." },
  { id: "b1", speaker: "bot", text: "Then ask me. What is it?", camera: "peek", mood: "neutral", gap: 0.25, tone: "Gentle and immediate, like a friend leaning in. A short pause between the two sentences." },
  { id: "p3", speaker: "person", text: "It's embarrassing. It's too basic.", camera: "personMCU", emotion: "skeptical", gap: 0.25, tone: "Hesitant, looking away. A pause between the two sentences. Low voice." },
  { id: "b2", speaker: "bot", text: "Basic is where everyone started.", camera: "botMCU", mood: "neutral", gap: 0.2, tone: "Calm, kind, completely certain. Unhurried." },
  { id: "b2b", speaker: "bot", text: "They just forgot to tell you.", camera: "botCU", mood: "happy", gap: 0.15, tone: "Lighter, a small smile in the voice." },
  { beat: true, dur: 0.9, camera: "personCU", focus: "person", emotion: "skeptical" },
  { id: "p4", speaker: "person", text: "Honestly… what does a datum actually mean?", caption: "Honestly … what does a datum actually mean?", camera: "personCU", emotion: "neutral", gap: 0.25, tone: "Finally saying it out loud. Careful and a little nervous. A real pause after 'Honestly'." },
  { id: "p4b", speaker: "person", text: "I nod in class.", camera: "personMCU", emotion: "tired", gap: 0.25, tone: "A quiet admission, almost a sigh." },

  { insert: "ask", dur: 3.6, sfx: "whoosh" },

  { id: "b3", speaker: "bot", text: "It's the surface you agree to measure from.", camera: "botMCU", mood: "neutral", gap: 0.55, tone: "Teaching one idea, slowly and clearly, every word distinct. Lean on 'measure from'. No rush at all." },
  { id: "b3b", speaker: "bot", text: "Put the part on a table. The table is datum A.", camera: "botCU", mood: "neutral", gap: 0.05, tone: "Simple and concrete, like pointing at a real table. A clear pause between the two sentences. Lean on 'datum A'." },
  { beat: true, dur: 0.9, camera: "personMCU", focus: "person", emotion: "surprised" },
  { id: "p5", speaker: "person", text: "That's it?", camera: "personMCU", emotion: "surprised", gap: 0.15, tone: "Slow disbelief, almost a laugh of relief." },
  { id: "b4", speaker: "bot", text: "That's it. Everything else is measured from there.", camera: "botCU", mood: "happy", gap: 0.35, tone: "Warm and pleased. A pause after 'That's it.' Then plain and clear." },
  { id: "p6", speaker: "person", text: "Why did nobody say it like that?", camera: "personCU", emotion: "surprised", gap: 0.25, tone: "Thinking out loud. Half amazed, half annoyed at four wasted lectures." },
  { id: "b5", speaker: "bot", text: "Ask me the next one. And the one after.", camera: "botMCU", mood: "neutral", gap: 0.2, tone: "Steady and kind. Two short phrases with a small pause between them." },
  { id: "b5b", speaker: "bot", text: "I'm here.", camera: "botCU", mood: "happy", gap: 0.55, tone: "Warm, clear and unhurried. A simple promise, said plainly." },

  { insert: "title", dur: 2.4, title: "End of semester", sub: "GD&T lecture. Back row." },
  { beat: true, dur: 0.5, camera: "wide", focus: "person", emotion: "smile" },
  { id: "p7", speaker: "person", text: "I answered a question in class today. Out loud.", camera: "personMCU", emotion: "smile", gap: 0.15, tone: "Trying to sound casual but clearly proud. A pause before 'Out loud', said with a small smile." },
  { id: "b6", speaker: "bot", text: "Which one?", camera: "botMCU", mood: "neutral", gap: 0.15, tone: "Curious and playful. It already knows." },
  { id: "p8", speaker: "person", text: "Datums.", camera: "personCU", emotion: "smile", gap: 0.35, tone: "One word, proud, with a grin." },
  { id: "p8b", speaker: "person", text: "Then someone asked me to explain it.", camera: "personMCU", emotion: "smile", gap: 0.65, tone: "Quiet wonder. The surprise is that someone asked them. Unhurried." },
  { id: "b7", speaker: "bot", text: "Nobody at home is an engineer.", camera: "botMCU", mood: "proud", gap: 0.45, tone: "Slow, serious and gentle. Not sad. It sets up the next line." },
  { id: "b7b", speaker: "bot", text: "Someone at home is about to be.", camera: "botCU", mood: "proud", gap: 0.75, tone: "Slow, proud and certain. The most important line of the story. Lean on 'about to be'." },

  { insert: "endcard", dur: 1.6, sfx: "sting" },
  { id: "b8", speaker: "bot", text: "FixtureLabs. Built to make you hireable.", camera: "botCU", mood: "happy", onInsert: true, gap: 0.9 },
];
