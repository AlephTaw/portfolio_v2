"""Shared visual treatment for embedded MLPHD lesson units."""

import marimo as mo


def lesson_style() -> mo.Html:
    """Match an embedded Marimo unit to the portfolio's paper design system."""

    return mo.Html(
        """
        <style>
          :root { color-scheme: light; }
          body, marimo-app, #root {
            background: hsl(51 25% 97%) !important;
            color: #191714;
          }
          marimo-app { font-family: Geist, Arial, Helvetica, sans-serif; }
          .markdown { color: #514a40; line-height: 1.8; }
          .markdown h1 { color: #191714; font-weight: 300; }
          .markdown h2 {
            color: #615754;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }
          .markdown h3, .markdown h4 { color: #191714; }
        </style>
        """
    )
