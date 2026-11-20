# PSYC 402 – Team 1 Mandela Effect Lab: 1%–100% slider revision

## What's in this ZIP

- **index.html** – the complete original Mandela Effect Lab, with the confidence slider labeled 1%–100% and a placeholder until it is deliberately moved. All 12 questions, answers, explanations, scoring, styling, and research content are retained.
- **confidence_required.js** – replaces the earlier numbered confidence buttons with the native 1%–100% **slider**, in increments of 1. Requires an intentional answer selection **and** slider interaction on every question.
- **datapipe.js** – the **unchanged** DataPipe integration from the previous complete ZIP, containing Team 1 / Chain A configuration, automatic summary/trial CSV uploads, failure retries, backup CSV downloads, and a configured redirect to https://aoifecunningham.github.io/Testing-Memory-Game/.
- **README_SETUP.md** – this setup and testing guide.

## Install in GitHub

1. Coordinate with your three teammates and back up the current website before overwriting anything. This package is based on the **previous complete DataPipe ZIP**, not later edits teammates may have made on GitHub.
2. **Extract the ZIP**. Do not upload the ZIP itself as a GitHub Pages file.
3. Open https://github.com/bennyham601-byte/Group1FinalProjectMem-Cog and **replace the existing `index.html`**, **replace `confidence_required.js`**, and **add/replace `datapipe.js`** using the three individual files in this package. All three files belong in the repository's root folder.
4. Commit the updates. The supplied HTML already loads `datapipe.js` and `confidence_required.js` exactly once and in the required order. **Do not add extra script tags.**
5. Open the published GitHub Pages site and hard refresh (Ctrl+Shift+R) before testing.

## Slider behavior

- The 12 questions, answer-choice buttons, question order, results view, and scoring are unchanged.
- Confidence is a **sliding scale, 1%–100%, step 1%**. Each question starts at the midpoint but displays **“Move the slider”**, not a preselected rating.
- **Next** stays disabled until the participant deliberately clicks one answer and interacts with the slider. Either action can be first. Both must be repeated for each new question.
- The resulting selected integer rating (1–100) is recorded in the experiment and in the CSV output.

## DataPipe / chain settings (same as previous complete package)

- Team: **1** (FIRST); chain: **A**.
- DataPipe experiment ID: **`PcdXNEsXPDQP`**.
- Endpoint: **`https://pipe.jspsych.org/api/data/`**.
- One cryptographically random anonymous `sid` is generated for each loaded session and reused across summary CSV, trials CSV, and next-project navigation.
- On question 12's submission, the page scores responses, displays **Saving...**, and automatically POSTs `summary_<sid>.csv` (one data row) and `trials_<sid>.csv` (12 data rows) in sequence. Both include `session_id`, `team_id`, `chain_id`.
- HTTP **201** or **202** is accepted as success, and an HTTP **400 `FILE_EXISTS`** error is accepted for a repeat upload.
- Redirect occurs **only after both required files are accepted**; a failed upload leaves participants on the page with **Retry saving** and two local CSV backup downloads.
- If Team 2 URL is configured, navigate with the same **`?sid=<sid>&chain=A`**.
- The original study explanation, results view, and scoring remain; the original manual CSV feature remains available as a failure fallback.

## Required before recruiting participants

**Team 2's destination is now configured:** `https://aoifecunningham.github.io/Testing-Memory-Game/`. After both DataPipe CSVs are accepted, Team 1 redirects there with the same `sid` and `chain=A`. Team 2 must also be configured to accept and preserve these values. The full chain remains subject to end-to-end testing before participant recruitment.

Have Dr. Onyper confirm the actual DataPipe storage results in his instructor-controlled Google Drive folder `402_Fall2026/Team1_402_Fall2026`, and verify settings: **Accept new data ON**, **CSV allowed**, do not require default `trial_type` unless supplied, and no unintended session limit. Team 1's experiment ID is not a password. Never upload participant datasets or identifying information to the public repository. Obtain approval for the on-screen consent wording before participant recruitment.

## Tests to perform on the published website

1. Every question: click an answer without moving the slider → **Next disabled**. Move the slider without choosing an answer → **Next disabled**. Do both → **Next enabled**. Check 1%, 100%, and intermediate values, and try keyboard arrow keys.
2. On question 2, verify **Next disabled again** until both actions are repeated. Continue all 12 items.
3. After item 12, confirm automatic **Saving...** status and no separate Save button.
4. Have the instructor verify the **summary** (1 row) and **trials** (12 rows) files arrived with matching `sid`, `team_id=1`, and `chain_id=A` and plausible confidence values.
5. In controlled testing, block/offline the DataPipe request and verify that the participant stays on the page with a retry option and backup CSV downloads; restore connectivity and retry.
6. Confirm the configured Team 2 destination is reached **only after successful uploads**, preserving the same `sid` and `chain=A`.
7. Follow your professor's requirements for testing the complete chain and on an additional device/browser before collecting real research-credit data.

## Verification scope

This package can be syntax checked and browser-tested with simulated API responses; **that does not establish live DataPipe receipt or prove the complete chain is functional**. The instructor must confirm data arrival and the group must test Team 2 handling of the incoming session ID.
