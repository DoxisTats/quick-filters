# Agent jobs – Doxis Business Studio prototype

Clickable, responsive prototype of the redesigned **Agent jobs** page (Administration › Jobs › Agents).
Plain HTML, CSS and JavaScript: no build step and no dependencies apart from Google Fonts.

![Desktop](docs/desktop.png)

| Filters drawer | Tablet | Phone |
| --- | --- | --- |
| ![Filters](docs/desktop-filters.png) | ![Tablet](docs/tablet.png) | ![Phone](docs/phone.png) |

## Publish on GitHub Pages (live link)

1. Create a new repository on GitHub (for example `agent-jobs`). It can be public, or private if your plan includes Pages for private repos.
2. Upload the **contents** of this folder to the repository root (drag and drop on github.com › *Add file › Upload files*, or with git):
   ```bash
   cd agent-jobs
   git init -b main
   git add .
   git commit -m "Agent jobs prototype"
   git remote add origin https://github.com/<user-or-org>/agent-jobs.git
   git push -u origin main
   ```
   Make sure the hidden `.github` folder is included (the git commands above do this; drag and drop on macOS may skip hidden folders, so press ⌘⇧. in Finder to show them).
3. In the repository go to *Settings › Pages › Build and deployment* and set **Source** to **GitHub Actions**.
4. The included workflow (`.github/workflows/pages.yml`) deploys on every push to `main`. After about a minute the link appears under *Settings › Pages* and on the workflow run:
   `https://<user-or-org>.github.io/agent-jobs/`

Alternative without Actions: set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`.

## Run it locally

Open `index.html` in a browser (double-click works), or serve the folder with `npx serve .` or `python3 -m http.server`.

## What works

- Status tabs (All, Current, Unsuccessful, Successful) with live counts
- Agent definition multi-select dropdown with search
- Text search on agent definition names
- Sort menu (Creation date or grouped by Agent definition, descending or ascending, search restrictions)
- Filters drawer (Status, Agent definition, Agent job type, Parent completed, Source, Creation date, ID & text search) with Apply, Cancel and Clear
- Row selection, bulk restart, single-row restart, restart all matching failed jobs, Undo toast
- Row details (start/end date, synchronous, group, sequence number, priority)
- Grouped view by agent definition

Fields without sample data (Trigger, Agent Runtime Service, Process class, dates, IDs) are layout only.

## Responsive behaviour

| Width | Layout |
| --- | --- |
| > 1100px | Full layout with fixed side menu |
| 721–1100px | Side menu becomes a slide-in menu (hamburger), toolbar wraps onto two lines |
| ≤ 720px | Table rows turn into cards, header search moves behind an icon, filters drawer is full screen, popovers open as bottom sheets |

## Files

```
index.html          page shell
css/styles.css      design tokens, components, breakpoints
js/icons.js         Untitled UI icon paths (from the Doxis Figma library)
js/data.js          sample jobs and side menu – replace with API data
js/app.js           state, rendering and interactions
assets/             Doxis logo and avatar
```

## Notes

- Colors, type and spacing follow the Doxis One.Cloud design system and the Business Studio Figma files.
- Sample data uses the HR agent definitions from the current Business Studio screen.
- `[Error message from job log]`, `[Other job type]` and similar bracketed values are placeholders.
