(() => {
  "use strict";

  const STORAGE_KEY = "yuki_atelier_ccna_review_v1";
  const list = document.getElementById("question-list");
  const progress = document.getElementById("quiz-progress");
  const progressFill = document.getElementById("quiz-progress-fill");
  const progressTrack = progressFill ? progressFill.parentElement : null;
  const filterButton = document.getElementById("review-filter");
  const chapterFilter = document.getElementById("chapter-filter");
  const resetButton = document.getElementById("progress-reset");
  const emptyState = document.getElementById("review-empty");
  const lastAnswer = document.getElementById("last-answer");

  if (!list || !progress || !filterButton || !chapterFilter || !resetButton || !emptyState || !lastAnswer) return;

  const storage = CCNAQuizState.acquire(window);
  const saved = CCNAQuizState.load(storage, STORAGE_KEY, CCNA_QUESTIONS);
  let reviewOnly = false;
  let selectedChapter = chapterFilter.value;

  function randomInt(max) {
    if (max <= 1) return 0;
    try {
      if (window.crypto && typeof window.crypto.getRandomValues === "function") {
        const limit = 0x100000000 - (0x100000000 % max);
        const buffer = new Uint32Array(1);
        do {
          window.crypto.getRandomValues(buffer);
        } while (buffer[0] >= limit);
        return buffer[0] % max;
      }
    } catch (_) {
      // Fall back to Math.random when secure randomness is unavailable.
    }
    return Math.floor(Math.random() * max);
  }

  function shuffledQuestion(question) {
    const choices = question.choices.map((text, index) => ({ text, index }));
    for (let index = choices.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(index + 1);
      [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
    }
    return {
      ...question,
      choices: choices.map((choice) => choice.text),
      answer: choices.findIndex((choice) => choice.index === question.answer),
    };
  }

  function saveProgress() {
    return CCNAQuizState.save(storage, STORAGE_KEY, saved);
  }

  function chapterQuestions() {
    if (selectedChapter === "all") return CCNA_QUESTIONS;
    return CCNA_QUESTIONS.filter((question) => question.chapter === selectedChapter);
  }

  function visibleQuestions() {
    const questions = chapterQuestions();
    if (!reviewOnly) return questions;
    return questions.filter((question) => saved[question.id] === "wrong");
  }

  function updateProgress() {
    const questions = chapterQuestions();
    const answered = questions.filter((question) => saved[question.id]).length;
    const correct = questions.filter((question) => saved[question.id] === "correct").length;
    const review = questions.filter((question) => saved[question.id] === "wrong").length;
    const label = selectedChapter === "all" ? "全章" : selectedChapter;
    progress.textContent = `${label}・${questions.length}問中 ${answered}問回答・${correct}問正解・要復習${review}問`;
    const percentage = questions.length ? Math.round((answered / questions.length) * 100) : 0;
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressTrack) progressTrack.setAttribute("aria-valuenow", String(percentage));
  }

  function clearLastAnswer() {
    lastAnswer.replaceChildren();
    lastAnswer.hidden = true;
  }

  function showLastAnswer(question, storageSaved) {
    lastAnswer.hidden = false;
    lastAnswer.replaceChildren();
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
    lastAnswer.focus();
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
      render();
      showLastAnswer(question, storageSaved);
    }
  }

  function buildCard(question, displayIndex) {
    const card = document.createElement("article");
    card.className = "quiz-card";
    card.dataset.questionId = question.id;

    const meta = document.createElement("p");
    meta.className = "quiz-meta";
    meta.textContent = `${question.chapter}・${question.session}・${question.topic}`;

    const heading = document.createElement("h3");
    heading.className = "quiz-question";
    heading.textContent = `Q${displayIndex + 1}. ${question.question}`;

    let figure = null;
    if (question.image) {
      figure = document.createElement("figure");
      figure.className = "quiz-figure";
      figure.style.margin = "0 0 18px";
      const image = document.createElement("img");
      image.src = question.image;
      image.alt = question.imageAlt || "";
      image.loading = "lazy";
      image.decoding = "async";
      image.style.cssText = "display:block;width:100%;height:auto;border:1px solid #e0e7f0;border-radius:12px;background:#f8fafc";
      figure.appendChild(image);
    }

    const choices = document.createElement("div");
    choices.className = "quiz-choices";
    question.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-choice";
      button.textContent = choice;
      button.style.whiteSpace = "pre-wrap";
      button.style.overflowWrap = "anywhere";
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

    card.append(meta, heading);
    if (figure) card.appendChild(figure);
    card.append(choices, result, explanation);
    return card;
  }

  function buildChapterSection(chapter, questions, startIndex) {
    const section = document.createElement("section");
    section.className = "chapter-section";
    const heading = document.createElement("h2");
    heading.className = "chapter-heading";
    heading.textContent = chapter;
    section.append(heading, ...questions.map((question, index) => buildCard(question, startIndex + index)));
    return section;
  }

  function render() {
    const questions = visibleQuestions().map(shuffledQuestion);
    const chapters = [...new Set(questions.map((question) => question.chapter))];
    let displayIndex = 0;
    const sections = chapters.map((chapter) => {
      const chapterItems = questions.filter((question) => question.chapter === chapter);
      const section = buildChapterSection(chapter, chapterItems, displayIndex);
      displayIndex += chapterItems.length;
      return section;
    });
    list.replaceChildren(...sections);
    emptyState.hidden = questions.length !== 0;
    filterButton.textContent = reviewOnly ? "全問を表示" : "要復習だけ表示";
    filterButton.setAttribute("aria-pressed", String(reviewOnly));
    updateProgress();
  }

  chapterFilter.addEventListener("change", () => {
    selectedChapter = chapterFilter.value;
    clearLastAnswer();
    render();
  });

  filterButton.addEventListener("click", () => {
    reviewOnly = !reviewOnly;
    clearLastAnswer();
    render();
  });

  resetButton.addEventListener("click", () => {
    Object.keys(saved).forEach((key) => delete saved[key]);
    saveProgress();
    reviewOnly = false;
    selectedChapter = "all";
    chapterFilter.value = "all";
    clearLastAnswer();
    render();
  });

  render();
})();
