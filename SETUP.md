# Vibe Apps: Setup and Daily Use

## What's in this folder

| File | What it's for |
|---|---|
| `CLAUDE.md` | The standards. Claude Code reads this automatically at the start of every session. |
| `apps/` | One folder per app: `index.html` (the app) and `NOTES.md` (what it's for, change log). |
| `.claude/settings.json` | Claude Code rules: never read credential or data files, ask before `git push`, and scan after every edit. |
| `.claude/hooks/after-edit.js` | Scans each app file Claude changes and reports problems back to Claude. |
| `scripts/scan.sh` | Runs both checks. Run it yourself any time with `npm run scan`. |
| `scripts/check-html.js` | Our own rules: AI service calls, tracking, Firebase, outside hosts, personal info. |
| `.gitleaks.toml` | Secret-scanner settings |
| `.githooks/pre-commit` | Blocks any Git commit that contains a secret or a must-fix problem |
| `.gitignore` | Keeps credentials and student data files out of Git |

## Daily use

1. **Start.** Run `cd ~/code/vibe-apps && claude` (or open this folder in the Claude app).
2. **Add an app from Gemini.** Say "Import a new app called `<short-name>`", then paste
   the code from Gemini. Claude saves it unchanged, writes its notes, scans it, and
   commits the original before any changes.
3. **Change an app.** Describe what you want, try it in the preview, then "Commit this."
4. **Undo.** "Revert that commit" goes back to the last good version.
5. **The one rule:** don't change the same app in Gemini *and* here between syncs.
   If you keep working in Gemini, paste the new version in and commit it first.

## Setting up another computer (Mac or PC)

**Computers set up so far:**

- [x] Mac
- [x] First PC (November 7, 2026)
- [ ] Second PC: still to do. Clone the repo and follow the steps below.

The easiest way to get the repo onto another computer is a private GitHub repository.
Once that exists, start Claude Code on the new computer and paste this:

> Please set up my vibe-apps repo on this computer using SETUP.md. Explain each
> command before running it, and don't use sudo or administrator rights.
> 1. Check that git and node work. If not, tell me how to install them
>    (Windows: Git for Windows and Node.js LTS).
> 2. Set my git name and email if they aren't set yet: ask me what to use.
> 3. Install gitleaks from the official GitHub release for this computer, into my
>    user folder (Mac: ~/.local/bin). Verify the checksum.
> 4. Clone my vibe-apps repo from GitHub into ~/code/vibe-apps, next to canvas-scripts
>    (the personal-info check uses the word list in canvas-scripts/private/).
> 5. Run `git config core.hooksPath .githooks` there.
> 6. Run `npm run scan` and summarize the results.

On Windows, Claude Code runs the bash scripts through Git Bash, which comes with
Git for Windows.
