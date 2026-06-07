---
title: "Building Our First Game Loop"
date: 2026-05-22
category: "Development"
readtime: "7 min read"
image: ""
excerpt: "Every game has a heartbeat called the game loop. Here's what it is, why it matters, and how we built a simple one in plain JavaScript."
---

When we started building games, the very first thing that confused us was this:
how does a game keep _moving_ even when you're not pressing anything? The answer
is the **game loop** — a piece of code that runs over and over, many times per
second.

## What is a game loop?

A game loop does three jobs, again and again, every single frame:

1. **Process input** — did the player press a key?
2. **Update** — move things, check collisions, update the score.
3. **Render** — draw the new picture to the screen.

Do that 60 times a second and the human eye sees smooth motion. Stop the loop
and the game freezes.

> "A game is just a really fast flip-book that you get to control." — something
> my son said that finally made it click for both of us.

## The simplest loop in JavaScript

Browsers give us a perfect tool for this called `requestAnimationFrame`. It
politely asks the browser to run our function right before the next repaint —
usually 60 times a second.

```js
// Our very first game loop
let score = 0;

function gameLoop() {
  processInput();   // 1. read the keyboard
  update();         // 2. move everything
  render();         // 3. draw the frame

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

## What we learned

- Games aren't magic — they're just fast loops.
- Breaking a big idea into _input → update → render_ makes it approachable.
- Reading the docs (and asking AI to explain them) beats copy-pasting.

Next time we'll add a player you can actually move around. Until then, try
changing the loop above and see what breaks — that's where the real learning
happens.
