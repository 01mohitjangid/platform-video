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

## Make a video

1. Script: `src/scripts/<episode>.ts` (lines, camera, emotion, inserts). Register it in `src/episodes.ts` and `src/Root.tsx`.
   Every script is a story in four acts: a `title` card sets the time and the stakes, the person tries the wrong thing, FixtureAI turns it, the payoff lands (a second `title` card jumps forward in time when the payoff happens later).
2. Voices: `EPISODE=<episode> SCRIPT_TS=src/scripts/<episode>.ts python tools/audio.py lines`, then `… manifest`.
   Needs `OPENAI_API_KEY` (in the shell or in a git-ignored `.env` here), numpy and ffmpeg. Voices are cached in `$TTS_RAW_DIR`.
   A line's optional `tone` tells the voice how to say it and where to pause. An optional `rate` (for example `1.3`) speeds up one line that must sound rushed. `ask` and `interview` are voiced at natural speed: add `TEMPO=1.0`.
   The silence heard after a line is its `gap` plus 0.26 s of padding in the voice file.
3. Screens: one component per insert kind in `src/ui/scenes/`, listed in `src/types.ts` and `src/ui/Insert.tsx`.
4. Render: `npx remotion render src/index.ts LugNut out/lug-nut.mp4` (or `LugNutWide`).

`npm run studio` opens the Remotion studio. `tools/sheet.sh out/x.mp4` makes contact sheets for a frame-by-frame review.

Music and sound effects live in `public/audio/` and are shared by every episode. The brand voice rules are in `../platform/BRAND.md` (the platform repo).
