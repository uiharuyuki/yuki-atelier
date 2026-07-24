(() => {
  "use strict";

  const STORAGE_KEY = "yuki_atelier_ccna_review_v1";
  const list = document.getElementById("question-list");
  const progress = document.getElementById("quiz-progress");
  const filterButton = document.getElementById("review-filter");
  const resetButton = document.getElementById("progress-reset");
  const emptyState = document.getElementById("review-empty");
  const lastAnswer = document.getElementById("last-answer");

  if (!list || !progress || !filterButton || !resetButton || !emptyState || !lastAnswer) return;

  const saved = CCNAQuizState.load(window.localStorage, STORAGE_KEY, CCNA_QUESTIONS);
  let reviewOnly = false;

  function saveProgress() {
    return CCNAQuizState.save(window.localStorage, STORAGE_KEY, saved);
  }

  function visibleQuestions() {
    if (!reviewOnly) return CCNA_QUESTIONS;
    return CCNA_QUESTIONS.filter((question) => saved[question.id] === "wrong");
  }

  function updateProgress() {
    const answered = CCNA_QUESTIONS.filter((question) => saved[question.id]).length;
    const correct = CCNA_QUESTIONS.filter((question) => saved[question.id] === "correct").length;
    const review = CCNA_QUESTIONS.filter((question) => saved[question.id] === "wrong").length;
    progress.textContent = `${CCNA_QUESTIONS.length}問中 ${answered}問回答・${correct}問正解・要復習${review}問`;
  }

  function clearLastAnswer() {
    lastAnswer.replaceChildren();
    lastAnswer.hidden = true;
  }

  function showLastAnswer(question, storageSaved) {
    const title = document.createElement("strong");
    title.textContent = "正解して要復習から外れました";
    const answer = document.createElement("p");
    answer.textContent = `正解: ${question.choices[question.answer]}`;
    const explanation = document.createElement("p");
    explanation.textContent = question.explanation;
    lastAnswer.replaceChildren(title, answer, explanation);
    if (!storageSaved) {
      const warning = document.createElement("p");
      warning.textContent = "この端末では進捗を保存できません。画面を閉じると結果が消える場合があります。";
      lastAnswer.appendChild(warning);
    }
    lastAnswer.hidden = false;
  }

  function answerQuestion(question, selectedIndex, card) {
    if (card.dataset.answered === "true") return;
    card.dataset.answered = "true";

    const buttons = [...card.querySelectorAll(".quiz-choice")];
    const explanation = card.querySelector(".quiz-explanation");
    const result = card.querySelector(".quiz-result");
    const correct = selectedIndex === question.answer;
    const correctChoice = question.choices[question.answer];

    buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === question.answer) {
        button.classList.add("correct");
        button.textContent = `${question.choices[index]}　【正解】`;
        button.setAttribute("aria-label", `${question.choices[index]}、正解`);
      }
      if (index === selectedIndex && !correct) {
        button.classList.add("wrong");
        button.textContent = `${question.choices[index]}　【選択した回答】`;
        button.setAttribute("aria-label", `${question.choices[index]}、選択した不正解の回答`);
      }
    });

    saved[question.id] = correct ? "correct" : "wrong";
    const storageSaved = saveProgress();
    result.textContent = correct
      ? `正解: ${correctChoice}`
      : `不正解。正解は「${correctChoice}」。あとで要復習から解き直そう。`;
    if (!storageSaved) {
      result.textContent += " この端末では進捗を保存できません。";
    }
    result.className = `quiz-result ${correct ? "is-correct" : "is-wrong"}`;
    explanation.hidden = false;
    updateProgress();

    if (reviewOnly && correct) {
      showLastAnswer(question, storageSaved);
      render();
    }
  }

  function buildCard(question, displayIndex) {
    const card = document.createElement("article");
    card.className = "quiz-card";
    card.dataset.questionId = question.id;

    const meta = document.createElement("p");
    meta.className = "quiz-meta";
    meta.textContent = `${question.session}・${question.topic}`;

    const heading = document.createElement("h2");
    heading.className = "quiz-question";
    heading.textContent = `Q${displayIndex + 1}. ${question.question}`;

    const choices = document.createElement("div");
    choices.className = "quiz-choices";
    question.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-choice";
      button.textContent = choice;
      button.addEventListener("click", () => answerQuestion(question, index, card));
      choices.appendChild(button);
    });

    const result = document.createElement("p");
    result.className = "quiz-result";
    result.setAttribute("aria-live", "polite");

    const explanation = document.createElement("div");
    explanation.className = "quiz-explanation";
    explanation.hidden = true;
    const explanationTitle = document.createElement("strong");
    explanationTitle.textContent = "解説";
    const explanationText = document.createElement("p");
    explanationText.textContent = question.explanation;
    explanation.append(explanationTitle, explanationText);

    card.append(meta, heading, choices, result, explanation);
    return card;
  }

  function render() {
    const questions = visibleQuestions();
    list.replaceChildren(...questions.map(buildCard));
    emptyState.hidden = questions.length !== 0;
    filterButton.textContent = reviewOnly ? "全問を表示" : "要復習だけ表示";
    filterButton.setAttribute("aria-pressed", String(reviewOnly));
    updateProgress();
  }

  filterButton.addEventListener("click", () => {
    reviewOnly = !reviewOnly;
    clearLastAnswer();
    render();
  });

  resetButton.addEventListener("click", () => {
    Object.keys(saved).forEach((key) => delete saved[key]);
    saveProgress();
    reviewOnly = false;
    clearLastAnswer();
    render();
  });

  render();
})();
