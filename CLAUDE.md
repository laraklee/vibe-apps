# Vibe Apps: Standards for Claude

This repo holds Lara's small single-page HTML apps (review games, prelab
activities, and similar), most first built in Gemini. Each app lives in its own
folder under `apps/`. The whole `vibe-apps` folder is one Git repository.

Lara is a high school science teacher, new to Claude Code and the command line.
Explain commands in plain language when you propose them, and prefer small,
reviewable steps over large multi-file changes.

## Hard rules (never break these)

1. **No secrets in code.** No API keys, tokens, or passwords in any file. If an
   app needs a key to work (for example, it calls Gemini or another AI service),
   stop and tell Lara before going further.
2. **No student data.** Apps must not send names, emails, answers, or scores to
   any server, form, spreadsheet, or AI service. Saving progress on the student's
   own device (`localStorage`) is fine. If an app needs to collect or send student
   information, stop and ask Lara first. Never put student data files (CSV, XLSX,
   exports) in this folder.
3. **No tracking or cloud storage.** No analytics, ad scripts, or Firebase or other
   cloud databases. Gemini sometimes adds Firebase setup code; point it out to Lara
   and remove it only after Lara agrees.
4. **Trusted outside resources only.** Scripts, styles, and fonts may load only from
   the hosts listed in `scripts/check-html.js` (`ALLOWED_HOSTS`). Ask Lara before
   adding a new host.
5. **Ask before publishing.** Never run `git push` or publish an app anywhere
   (GitHub Pages, a Claude artifact, Google Sites) without asking first.
6. **Never read** `~/.clasprc.json`, `.env` files, or any credential file.

## How apps are organized

```
apps/
  <short-name>/        lowercase-with-dashes, for example cell-organelles-review
    index.html         the app itself
    NOTES.md           what it's for and where it's used (see below)
```

`NOTES.md` for each app lists: what the app does; class and unit; where it came
from (for example "Gemini, November 2026"); where students use it (published
link, if any); and a short change log of what Lara asked for.

Keep each app one self-contained `index.html` unless there's a good reason to
split it. Apps should work on phones and Chromebooks.

## Workflow

- **Importing from Gemini:** save Lara's code exactly as she gives it to
  `apps/<short-name>/index.html`, write `NOTES.md`, run the scan, and commit
  ("Import <name> from Gemini") *before* changing anything, so the original is
  always in the history.
- **Making changes:** one focused change per commit, with a clear message. Update
  the change log in that app's `NOTES.md` in the same commit.
- **The one rule:** don't edit the same app in two places between syncs. If Lara
  keeps working on an app in Gemini, Lara pastes the new version here and we commit
  it ("Sync <name> from Gemini") before making more changes here.
- **Trying an app:** open `index.html` in the built-in browser preview so Lara can
  click through it before committing.

## Checks

- After every file edit, a hook runs `scripts/scan.sh` on the changed file. If it
  reports problems, fix them or explain them to Lara before moving on.
- Before committing, run `npm run scan` (all apps). Git's pre-commit hook also runs
  the secret scan and the HTML check, and blocks commits with must-fix problems.
- When you finish a change, give Lara a short review summary: what changed, any new
  outside hosts or network calls, and the scan results.
