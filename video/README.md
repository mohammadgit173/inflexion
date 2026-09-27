# Animated math videos (Manim)

Scenes for explanation videos, in the site's colours and fonts. Manim is the
Python animation library behind 3Blue1Brown; this uses the maintained
community edition.

Nothing here affects the website. It's a separate toolbox that produces video
files you upload to YouTube.

## One-time setup

From the project root:

```bash
python -m venv video/.venv
video/.venv/Scripts/activate
pip install -r video/requirements.txt
```

This is already done on your machine: Manim 0.21 is installed in `video/.venv/`
and `InflexionPoint` renders.

The environment lives in `video/.venv/` and is ignored by git. Delete that
folder to undo the install completely; nothing is installed system-wide.

**If the install fails on Python 3.13**, install Python 3.12 and point the
first command at it (`py -3.12 -m venv video/.venv`). Manim's dependencies
sometimes lag behind the newest Python release.

**LaTeX is optional.** Only the `WhyTheChainRule` scene needs it, for typeset
equations. Install MiKTeX (<https://miktex.org>) if you want it; the other
scenes render without it.

## Rendering

Run these **from inside `video/`**, so Manim picks up `manim.cfg` and writes
to `video/out/` rather than scattering a `media/` folder at the project root:

```bash
cd video
.venv/Scripts/activate
manim -pql inflexion.py InflexionPoint    # fast draft, opens when done
manim -pqh inflexion.py InflexionPoint    # 1080p60, for publishing
```

`-p` plays the file when it finishes, `-ql` is low quality (quick while you're
iterating), `-qh` is high. Files land in `video/out/`.

## What's in `inflexion.py`

| Scene | Shows | LaTeX needed |
|---|---|---|
| `InflexionPoint` | A cubic curve with a tangent running along it, marking where the bend changes direction — the brand idea, and a good intro clip | No |
| `TangentSweep` | The derivative drawing itself underneath a parabola as the tangent sweeps | No |
| `WhyTheChainRule` | A typeset equation transforming into its result | Yes |

The palette at the top of the file matches `app/globals.css`, so videos look
like they belong to the site.

## Making this practical

A polished animated video takes hours per finished minute, most of it spent
writing animation code rather than teaching. A realistic split:

- **Most videos:** screen-record yourself explaining on the whiteboard you
  already use in sessions. Fast, and it sounds like you.
- **A few signature clips:** Manim, where motion genuinely explains something
  a still image can't.

Audio matters more than visuals. A cheap USB microphone in a quiet room beats
beautiful animation with laptop-mic sound.

## Getting a video onto the site

Upload to YouTube, copy the id from the URL (the part after `v=`), and put it
in `messages/fr.json` and `messages/en.json` under `about.videoId`. The intro
video section is hidden until that value is filled in.
