/*
 * PSYC 402 - Mandela Effect Lab: deliberate 1%-100% confidence slider.
 * This replaces ONLY the earlier numbered confidence buttons.
 * Load AFTER the original inline experiment script and datapipe.js.
 * Do not change the experiment's stimuli, answer scoring, DataPipe saves,
 * CSV data, session IDs, or next-project redirect.
 */
(() => {
  "use strict";

  const task = document.getElementById("task");
  const answerChoices = document.getElementById("choices");
  const nextButton = document.getElementById("next");
  const slider = document.getElementById("confidence");
  const output = document.getElementById("confidenceValue");

  if (!task || !answerChoices || !nextButton || !slider || !output) {
    console.error("Mandela slider: experiment controls were not found.");
    return;
  }

  // Exactly 100 possible integer ratings. A default knob position is never
  // accepted as a response until the participant interacts with the slider.
  slider.type = "range";
  slider.min = "1";
  slider.max = "100";
  slider.step = "1";
  slider.value = "50";
  slider.removeAttribute("aria-hidden");
  slider.removeAttribute("tabindex");
  slider.style.display = "";

  // Clean up any old numbered option group if one was left in the markup.
  document.getElementById("confidenceNumberOptions")?.remove();

  let choseAnswer = false;
  let touchedSlider = false;

  function syncNext() {
    nextButton.disabled = !(choseAnswer && touchedSlider);
  }

  function markSliderChosen() {
    if (task.classList.contains("hidden")) return;
    touchedSlider = true;
    output.textContent = `${slider.value}%`;
    syncNext();
  }

  // Moving the thumb or using keyboard range controls records a deliberate
  // confidence action, while allowing every integer from 1 to 100.
  slider.addEventListener("input", markSliderChosen);
  // Clicking the thumb without changing its value is also an explicit choice.
  slider.addEventListener("click", markSliderChosen);

  // Each original answer button sets the stored 'selected' response in the
  // main script. We only add the requirement to choose confidence too.
  answerChoices.addEventListener("click", event => {
    const choice = event.target.closest("button.choice");
    if (!choice || !answerChoices.contains(choice) || task.classList.contains("hidden")) return;
    choseAnswer = true;
    syncNext();
  });

  function resetForNextQuestion() {
    choseAnswer = false;
    touchedSlider = false;
    slider.value = "50";
    output.textContent = "Move the slider";
    syncNext();
  }

  // The original render() recreates choice buttons for each question.
  // Reset both requirements on EVERY question, not just the first one.
  const observer = new MutationObserver(mutations => {
    if (mutations.some(m => m.type === "childList")) resetForNextQuestion();
  });
  observer.observe(answerChoices, { childList: true });
  resetForNextQuestion();
})();
