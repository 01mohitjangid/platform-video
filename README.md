# FixtureLabs videos

Short product videos in a 3D low-poly style: a student at a desk talks with FixtureAI (the white Visor bot), with
real-looking app screens cut in. Rendered with Remotion. Every episode renders twice: a 9:16 reel and a 16:9 wide cut.

| Episode     | Title                                       | Feeling       |
| ----------- | ------------------------------------------- | ------------- |
| `lug-nut`   | This lug nut is harder than your finals.    | Pride         |
| `interview` | The interview I bombed.                     | Second chance |
| `hours`     | The hours that count.                       | Being seen    |
| `contest`   | The contest I almost skipped.               | Belonging     |
| `dfm`       | The bracket that cost four times more.      | Craft         |
| `ask`       | Nobody at home is an engineer.              | Permission    |

## Folders

Every story has the same shape in three places. Each version is a number: `v1`, `v2` … `vN`.

```
src/scripts/ask/v1.ts             the script of version 1      ← you write these
src/scripts/ask/v2.ts             the script of version 2
public/audio/ask/v1/              its voices: manifest.json + levels.json (tracked), lines/*.wav (generated)
public/audio/ask/v2/
out/ask/v1.mp4, v1-wide.mp4       its renders (git-ignored)
out/ask/v2.mp4, v2-wide.mp4
```

The rest of the project is shared by every story and version:

```
src/
  index.ts           entry point Remotion renders
  Root.tsx           two compositions per version: ask-v2 (9:16) and ask-v2-wide (16:9)
  episodes.ts        finds every src/scripts/<story>/vN.ts that has voices; no list to edit
  Episode.tsx        plays one version: 3D scene, inserts, subtitles, audio
  timeline.ts        turns a script into frames
  types.ts           script types (lines, inserts, beats, cameras, emotions)
  scene/             3D room, student, FixtureAI, camera
  ui/scenes/         one app screen per insert kind   ← add one for a new feature
  overlay/           subtitles
public/
  audio/music.wav    music (generated)
  audio/sfx/         sound effects (generated)
  brand/             logos
tools/               audio.py (voices), new-version.py, render.sh, QA scripts
docs/                character concept pages
```

## Make a new video

1. **Script**: copy one in `src/scripts/` to `src/scripts/<episode>.ts` and edit the lines, cameras, emotions and inserts.
   Every script is a story in four acts: a `title` card sets the time and the stakes, the person tries the wrong thing, FixtureAI turns it, the payoff lands (a second `title` card jumps forward in time when the payoff happens later).
2. **Voices**: `EPISODE=<episode> python tools/audio.py lines`, then `EPISODE=<episode> python tools/audio.py manifest`.
   Needs `OPENAI_API_KEY` (in the shell or in a git-ignored `.env` here), numpy and ffmpeg. Voices are cached in `$TTS_RAW_DIR`.
   A line's optional `tone` tells the voice how to say it and where to pause. An optional `rate` (for example `1.3`) speeds up one line that must sound rushed. `ask` and `interview` are voiced at natural speed: add `TEMPO=1.0`.
   The silence heard after a line is its `gap` plus 0.26 s of padding in the voice file.
3. **Register**: add the script, `manifest.json` and `levels.json` to `src/episodes.ts`. That is the only list. `Root.tsx` makes the compositions from it (`my-story` → `MyStory` and `MyStoryWide`).
4. **New screen** (only if the story shows a feature no screen covers yet): add a component in `src/ui/scenes/`, its kind in `src/types.ts`, and an entry in `src/ui/Insert.tsx` and `src/ui/dev-entry.tsx`. The type check fails until all four are there.
5. **Render**: `npm run render -- lug-nut` writes `out/lug-nut.mp4` (9:16) and `out/lug-nut-wide.mp4` (16:9).

## Versions

`ask` is the draft you edit. Saved versions sit next to it as `ask-v1`, `ask-v2` and so on, and they never change.

1. **Save**: when you like the draft, run `npm run save-version -- ask`. It copies the script, the voice files and the manifest to the next free number (say `ask-v2`) and adds it to `src/episodes.ts`.
2. **Render the saved copy**: `npm run render -- ask-v2` writes `out/ask-v2.mp4` and `out/ask-v2-wide.mp4`.
3. **Keep going**: edit `src/scripts/ask.ts` and voice it again. The saved version keeps its own voices.

In Studio, each story is a folder that holds the draft and all its versions (`Ask`, `AskV1`, `AskV2`, …).

All versions share the 3D scene, the screens, the music and the sound effects. A change there shows up in every version the next time it renders. The `.mp4` in `out/` is the exact cut, so keep it.

Voice `.wav` files and renders are git-ignored, so a saved version's voices exist only on this disk. Back up `public/audio/` and `out/` (for example to Drive). Voicing a line again gives a different take.

## Other commands

`npm run studio` opens the Remotion studio. `npx tsc` type-checks. `tools/sheet.sh out/x.mp4` makes contact sheets for a frame-by-frame review.

The brand voice rules are in `../platform/BRAND.md` (the platform repo).
