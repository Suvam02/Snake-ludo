# Snake & Ladder Word Quest

A 10x10 Snake & Ladder vocabulary-learning web game with:
- automatic dice rolling,
- one word per cell,
- meaning input challenge,
- scoring: **+3** for correct, **-1** for wrong.

## Play Online (GitHub Pages)

After enabling Pages for this repository, your game will be available at:

- `https://<your-github-username>.github.io/<your-repository-name>/`

Example:

- `https://octocat.github.io/Snake-ludo/`

## Publish to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to your selected branch (`main`, `master`, or `work`) or run the workflow manually from the **Actions** tab.
5. Open the Pages URL shown in the workflow run output.

## Local Run

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.
