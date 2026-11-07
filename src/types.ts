export type Speaker = "person" | "bot";

export type Aspect = "portrait" | "landscape";

/** Camera framings the 3D scene knows how to render. Every shot pushes in slowly from `progress` 0 → 1. */
export type CameraPreset =
  | "wide" // whole desk, both characters, window behind
  | "twoShot" // person + FixtureAI over the laptop
  | "personMCU" // person, chest up
  | "personCU" // person, face
  | "botMCU" // FixtureAI, body
  | "botCU" // FixtureAI, face, low angle
  | "peek"; // FixtureAI rising from behind the laptop screen

export type Emotion = "neutral" | "skeptical" | "surprised" | "annoyed" | "smile" | "tired";

/** Full-frame 2D UI inserts, shown like the laptop screen filling the frame. */
export type InsertKind =
  | "challenge" // the lug nut challenge card: part preview, checks, attempt 2 failed
  | "feedback" // FixtureAI feedback: the two things wrong, with the drawing callouts
  | "passed" // attempt 3: every check green, points, rank
  | "interview" // Interview Studio: the question, the answer, the evaluation card
  | "hours" // public profile: Verified Build Hours, by domain, share link
  | "contest" // a live contest room: timer, the four problems, the rank climbing
  | "dfm" // FixtureAI DFM review: machining cost multiple and the three flags
  | "ask" // FixtureAI chat: the basic question, the plain answer, a crash course chip
  | "title" // chapter card: a time or place line, used to open an act or jump in time
  | "endcard"; // logo + "Built to make you hireable."

export interface Line {
  id: string;
  speaker: Speaker;
  /** What is spoken (sent to TTS). */
  text: string;
  /** What is shown as a subtitle, if different from `text`. */
  caption?: string;
  camera: CameraPreset;
  emotion?: Emotion;
  /** Silence after the line, seconds. Default 0.25. */
  gap?: number;
  /** Sound effect fired at the start of the line. */
  sfx?: SfxKind;
  /** Spoken over the insert that precedes it (the insert keeps running); no subtitle, no 3D shot. */
  onInsert?: boolean;
  /** FixtureAI's mood for its own line (held for the whole shot). Default "neutral". */
  mood?: Mood;
}

export type Mood = "neutral" | "happy" | "proud";

export type SfxKind = "pop" | "whoosh" | "click" | "chime" | "sting";

export interface Insert {
  insert: InsertKind;
  /** Seconds on screen. */
  dur: number;
  sfx?: SfxKind;
  /** `title` cards only: the big line and the smaller line under it. */
  title?: string;
  sub?: string;
}

export interface Beat {
  /** A silent reaction shot. */
  beat: true;
  dur: number;
  camera: CameraPreset;
  emotion?: Emotion;
  /** Which character is "live" in the beat (for idle gestures). */
  focus?: Speaker;
}

export type SequenceItem = Line | Insert | Beat;

export const isLine = (i: SequenceItem): i is Line => "speaker" in i;
export const isInsert = (i: SequenceItem): i is Insert => "insert" in i;
export const isBeat = (i: SequenceItem): i is Beat => "beat" in i;

/** public/audio/<episode>/manifest.json — written by the audio pipeline. */
export interface AudioManifest {
  lines: Record<string, { file: string; duration: number }>;
  music: { file: string; duration: number };
  sfx: Record<SfxKind, { file: string; duration: number }>;
}

/** One resolved segment on the timeline, in frames. */
export interface Segment {
  item: SequenceItem;
  from: number;
  durationInFrames: number;
}
