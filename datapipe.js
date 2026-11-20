/*
 * PSYC 402 - Team 1 Mandela Effect Lab
 * DataPipe integration for the existing index.html (inline experiment JavaScript).
 * Load this file AFTER the original inline <script> in index.html.
 *
 * Team 2 GitHub Pages destination is configured below.
 * Do not add participant data to GitHub.
 */
(() => {
  "use strict";

  const TEAM_ID = "1";
  const CHAIN_ID = "A";
  const DATAPIPE_EXPERIMENT_ID = "PcdXNEsXPDQP";
  const DATAPIPE_ENDPOINT = "https://pipe.jspsych.org/api/data/";
  // Team 2: public GitHub Pages URL for Chain A.
  const NEXT_PROJECT_URL = "https://aoifecunningham.github.io/Testing-Memory-Game/";

  // The existing app defines these in an earlier, classic (non-module) script:
  // items, responses, startedAt, sessionId, finish, and show().
  if (typeof finish !== "function" || !Array.isArray(items)) {
    console.error("DataPipe: original experiment script was not loaded first.");
    return;
  }

  // Cryptographically random anonymous ID. The first project makes the ID;
  // later projects must keep the exact same ID passed in their URL.
  function makeAnonymousSid() {
    const bytes = new Uint8Array(12);
    if (globalThis.crypto && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      throw new Error("A secure browser connection is required for anonymous session IDs.");
    }
    return "MEL-" + Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  // Team 1 is FIRST: ignore any old sid in the URL and create a fresh one.
  sessionId = makeAnonymousSid();

  // Update outdated privacy statements on the existing site.
  const consentLabel = document.querySelector('label[for="consent"]');
  if (consentLabel) {
    consentLabel.textContent = "I am at least 18 years old, understand that this is a classroom demonstration, and voluntarily agree to continue. I understand that my anonymous answers and confidence ratings will be saved automatically to instructor-controlled research storage when I finish. No name or email address is collected here.";
  }
  const downloadButton = document.getElementById("download");
  if (downloadButton) {
    downloadButton.textContent = "Download backup CSV";
    downloadButton.style.display = "none";
  }
  const resultNote = document.querySelector("#results .actions + p.small");
  if (resultNote) {
    resultNote.textContent = "Your anonymous results are sent automatically to instructor-controlled DataPipe storage after you finish. The local CSV is available as a backup if saving fails.";
  }
  const footer = document.querySelector(".footer");
  if (footer) {
    footer.textContent = "THE MANDELA EFFECT LAB · PSYC 402 · Anonymous results are saved to instructor-controlled storage";
  }

  let finishedAt = "";
  let pendingFiles = null;
  let saving = false;
  let uploaded = false;
  const originalFinish = finish;

  function csvEscape(value) {
    return '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"';
  }
  function toCSV(rows) {
    if (!rows.length) throw new Error("No data rows to save.");
    const headers = Object.keys(rows[0]);
    return [headers.join(","), ...rows.map(row => headers.map(key => csvEscape(row[key])).join(","))].join("\r\n") + "\r\n";
  }

  function prepareData() {
    const correctCount = responses.filter(r => r.correct).length;
    const accuracy = Math.round(correctCount / responses.length * 10000) / 100;
    const meanConfidence = Math.round(responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length * 100) / 100;
    const common = {
      session_id: sessionId,
      team_id: TEAM_ID,
      chain_id: CHAIN_ID,
      session_start: startedAt ? startedAt.toISOString() : "",
      session_end: finishedAt
    };
    const summary = [{
      ...common,
      trial_count: responses.length,
      correct_count: correctCount,
      incorrect_count: responses.length - correctCount,
      accuracy_percent: accuracy,
      mean_confidence_percent: meanConfidence,
      confidence_accuracy_gap_pp: Math.round((meanConfidence - accuracy) * 100) / 100
    }];
    const trials = responses.map((r, index) => {
      const item = items[r.itemIndex];
      return {
        ...common,
        question_number: index + 1,
        item_id: r.itemIndex + 1,
        category: item.cat,
        question: item.q,
        selected_answer: item.a[r.selected],
        correct_answer: item.a[item.correct],
        is_correct: r.correct ? 1 : 0,
        confidence_percent: r.confidence,
        response_time_utc: r.time
      };
    });
    return [
      { filename: `summary_${sessionId}.csv`, csv: toCSV(summary) },
      { filename: `trials_${sessionId}.csv`, csv: toCSV(trials) }
    ];
  }

  async function sendCsvToDataPipe(filename, csvText) {
    const response = await fetch(DATAPIPE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experimentID: DATAPIPE_EXPERIMENT_ID,
        filename,
        data: csvText
      })
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 201 || response.status === 202) return;
    if (response.status === 400 && body.error === "FILE_EXISTS") return;
    throw new Error(body.error || `HTTP_${response.status}`);
  }

  function getStatusPanel() {
    let panel = document.getElementById("datapipeStatus");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "datapipeStatus";
      panel.className = "notice";
      panel.setAttribute("role", "status");
      panel.setAttribute("aria-live", "polite");
      const results = document.getElementById("results");
      const heading = results && results.querySelector("h2");
      if (heading) heading.insertAdjacentElement("afterend", panel);
      else document.body.appendChild(panel);
    }
    return panel;
  }

  function clearStatusActions() {
    document.getElementById("datapipeRetry")?.remove();
    document.getElementById("datapipeBackup")?.remove();
  }

  function downloadBackup(files) {
    files.forEach(({ filename, csv }) => {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  function nextProjectUrl() {
    if (!NEXT_PROJECT_URL.trim()) return null;
    const url = new URL(NEXT_PROJECT_URL);
    if (url.protocol !== "https:") throw new Error("Team 2 URL must be HTTPS.");
    url.searchParams.set("sid", sessionId);
    url.searchParams.set("chain", CHAIN_ID);
    return url.toString();
  }

  // Keep the results available for review. Advance only when the participant
  // clicks Next, and only after both DataPipe uploads have succeeded.
  const nextButton = document.createElement("button");
  nextButton.id = "nextProject";
  nextButton.className = "btn primary";
  nextButton.textContent = "Next →";
  nextButton.disabled = true;
  nextButton.style.display = "none";
  const resultsActions = document.querySelector("#results .actions");
  if (resultsActions) resultsActions.appendChild(nextButton);
  nextButton.addEventListener("click", () => {
    if (!uploaded) return;
    const destination = nextProjectUrl();
    if (destination) window.location.assign(destination);
  });

  async function saveThenRedirect() {
    if (saving || uploaded) return;
    saving = true;
    const status = getStatusPanel();
    clearStatusActions();
    status.textContent = "Saving your anonymous responses to the research system. Please do not close this tab…";

    // Do not allow starting another session while a save is pending.
    const restartButtons = document.querySelectorAll("#restart");
    restartButtons.forEach(button => { button.disabled = true; });

    try {
      if (!pendingFiles) pendingFiles = prepareData();
      for (const { filename, csv } of pendingFiles) {
        await sendCsvToDataPipe(filename, csv);
      }
      uploaded = true;
      const next = nextProjectUrl();
      if (next) {
        status.textContent = "Both data files were saved. You may review your results, then click Next to continue to the next activity.";
        nextButton.disabled = false;
        nextButton.style.display = "";
      } else {
        status.textContent = "Both data files were saved, but the Team 2 destination URL has not been configured. Please tell your instructor. This is not ready for participant recruitment.";
      }
    } catch (error) {
      console.error("DataPipe save failed:", error);
      status.textContent = "Saving failed or could not be verified. Your responses remain in this browser. Please retry; do not proceed to the next activity until saving succeeds.";
      const retry = document.createElement("button");
      retry.id = "datapipeRetry";
      retry.className = "btn primary";
      retry.textContent = "Retry saving";
      retry.addEventListener("click", saveThenRedirect);
      status.appendChild(document.createElement("br"));
      status.appendChild(retry);
      const backup = document.createElement("button");
      backup.id = "datapipeBackup";
      backup.className = "btn secondary";
      backup.textContent = "Download backup CSV files";
      backup.addEventListener("click", () => {
        if (pendingFiles) downloadBackup(pendingFiles);
      });
      status.appendChild(backup);
    } finally {
      saving = false;
    }
  }

  // Retain the original scoring, results, answer review and learning page.
  // Add automatic DataPipe saving to the completion event.
  finish = function () {
    if (finishedAt) return;
    finishedAt = new Date().toISOString();
    originalFinish();
    saveThenRedirect();
  };
})();
