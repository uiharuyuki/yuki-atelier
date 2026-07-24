const CCNAQuizState = (() => {
  "use strict";

  const ALLOWED_RESULTS = new Set(["correct", "wrong"]);

  function acquire(windowObject) {
    try {
      return windowObject.localStorage;
    } catch (_) {
      return null;
    }
  }

  function load(storage, key, questions) {
    try {
      const parsed = JSON.parse(storage.getItem(key) || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

      const knownIds = new Set(questions.map((question) => question.id));
      return Object.fromEntries(
        Object.entries(parsed).filter(
          ([questionId, result]) => knownIds.has(questionId) && ALLOWED_RESULTS.has(result)
        )
      );
    } catch (_) {
      return {};
    }
  }

  function save(storage, key, progress) {
    try {
      storage.setItem(key, JSON.stringify(progress));
      return true;
    } catch (_) {
      return false;
    }
  }

  return { acquire, load, save };
})();
