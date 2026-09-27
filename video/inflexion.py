"""
Animated math scenes for Inflexion, in the site's colours.

Render (from the project root, with the environment active — see README.md):

    manim -pql video/inflexion.py InflexionPoint     # fast draft, 480p
    manim -pqh video/inflexion.py InflexionPoint     # 1080p, for publishing

Swap the scene name for TangentSweep or WhyTheChainRule to render those.
Scenes here use Text rather than MathTex wherever possible, so they render
without a LaTeX install. The one scene that needs LaTeX says so.
"""

from manim import *

# --- Inflexion palette -------------------------------------------------------
# Matches app/globals.css so video and site look like the same brand.
BG = "#0A0A0B"
INK = "#FFFFFF"
MUTED = "#B4B4B6"      # white at ~70% on the dark background
ACCENT = "#5BA7E8"     # the site's cold technical blue
SAND = "#C9A227"       # used sparingly, for a single highlight

config.background_color = BG


class InflexionPoint(Scene):
    """The brand idea, literally: the point where a curve changes its mind.

    Draws y = x^3, runs a dot along it, and marks the inflection point at the
    origin. Plain x^3 is the clearest possible version: no local maximum or
    minimum to distract, and the tangent goes flat exactly at the point where
    the bend reverses.
    """

    def construct(self) -> None:
        axes = Axes(
            x_range=[-2.2, 2.2, 1],
            y_range=[-4.5, 4.5, 1],
            axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": False},
            tips=False,
        )

        def f(x: float) -> float:
            return x**3

        curve = axes.plot(f, x_range=[-1.65, 1.65], color=ACCENT, stroke_width=4)

        title = Text("Le point d'inflexion", font="IBM Plex Sans", color=INK)
        title.scale(0.6).to_edge(UP)

        self.play(Create(axes, run_time=1.2), Write(title, run_time=1.0))
        self.play(Create(curve, run_time=2.0))

        # A dot travelling along the curve, with the tangent that follows it.
        x = ValueTracker(-1.5)
        dot = always_redraw(lambda: Dot(axes.c2p(x.get_value(), f(x.get_value())), color=INK, radius=0.07))

        def tangent() -> Line:
            x0 = x.get_value()
            slope = 3 * x0**2             # f'(x) = 3x^2, which is 0 at the origin
            dx = 0.9
            p1 = axes.c2p(x0 - dx, f(x0) - slope * dx)
            p2 = axes.c2p(x0 + dx, f(x0) + slope * dx)
            return Line(p1, p2, color=SAND, stroke_width=3)

        tangent_line = always_redraw(tangent)

        self.play(FadeIn(dot), Create(tangent_line))
        self.play(x.animate.set_value(0.0), run_time=2.5, rate_func=linear)

        # At x = 0 the bending flips: that is the inflection point.
        mark = Dot(axes.c2p(0, 0), color=SAND, radius=0.1)
        label = Text("ici, la courbe change de sens", font="IBM Plex Sans", color=MUTED)
        label.scale(0.45).next_to(mark, UR, buff=0.3)

        self.play(FadeIn(mark, scale=1.6), Write(label))
        self.wait(0.6)
        self.play(x.animate.set_value(1.5), run_time=2.5, rate_func=linear)
        self.wait(0.8)

        # Close on the wordmark.
        wordmark = Text("INFLEXION", font="IBM Plex Mono", color=INK).scale(0.9)
        self.play(
            *[FadeOut(m) for m in [axes, curve, dot, tangent_line, mark, label, title]],
            run_time=0.8,
        )
        self.play(Write(wordmark, run_time=1.2))
        self.wait(1.2)


class TangentSweep(Scene):
    """The derivative, built underneath the curve as the tangent sweeps.

    The classic explanation: the slope at each point *is* a second graph.
    """

    def construct(self) -> None:
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-2, 4, 1],
            axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": False},
            tips=False,
        ).scale(0.9)

        def f(x: float) -> float:
            return 0.5 * x**2

        def df(x: float) -> float:
            return x

        curve = axes.plot(f, x_range=[-2.8, 2.8], color=ACCENT, stroke_width=4)
        f_label = Text("f(x)", font="IBM Plex Mono", color=ACCENT).scale(0.5)
        f_label.next_to(axes.c2p(2.4, f(2.4)), RIGHT, buff=0.2)

        self.play(Create(axes), Create(curve), FadeIn(f_label))

        x = ValueTracker(-2.6)
        dot = always_redraw(lambda: Dot(axes.c2p(x.get_value(), f(x.get_value())), color=INK, radius=0.06))

        def tangent() -> Line:
            x0 = x.get_value()
            dx = 0.9
            return Line(
                axes.c2p(x0 - dx, f(x0) - df(x0) * dx),
                axes.c2p(x0 + dx, f(x0) + df(x0) * dx),
                color=SAND,
                stroke_width=3,
            )

        # The slope value, drawn as a second curve that appears as we go.
        slope_curve = always_redraw(
            lambda: axes.plot(df, x_range=[-2.6, max(-2.59, x.get_value())], color=SAND, stroke_width=3)
        )
        slope_label = Text("f'(x) = la pente", font="IBM Plex Mono", color=SAND).scale(0.45)
        slope_label.to_corner(DR)

        self.play(FadeIn(dot), Create(tangent()), FadeIn(slope_label))
        self.add(always_redraw(tangent), slope_curve)
        self.play(x.animate.set_value(2.6), run_time=5.0, rate_func=smooth)
        self.wait(1.0)


class WhyTheChainRule(Scene):
    """Needs LaTeX installed (MiKTeX on Windows).

    Kept as an example of typeset equations; delete it if you never install
    LaTeX, and the other scenes will still render.
    """

    def construct(self) -> None:
        outer = MathTex(r"\frac{d}{dx}\,f(g(x))", color=INK).scale(1.1)
        result = MathTex(r"f'(g(x))", r"\cdot", r"g'(x)", color=INK).scale(1.1)
        result[0].set_color(ACCENT)
        result[2].set_color(SAND)

        caption = Text("dérive l'extérieur, puis l'intérieur", font="IBM Plex Sans", color=MUTED)
        caption.scale(0.5).next_to(result, DOWN, buff=0.8)

        self.play(Write(outer))
        self.wait(0.6)
        self.play(TransformMatchingShapes(outer, result), run_time=1.5)
        self.play(FadeIn(caption, shift=UP * 0.2))
        self.wait(1.5)
