(() => {
  "use strict";

  const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];
  const decimalInput = document.getElementById("decimal-input");
  const binaryOutput = document.getElementById("binary-output");
  const decimalFromBits = document.getElementById("decimal-from-bits");
  const bitButtons = [...document.querySelectorAll("[data-bit-index]")];
  const andInputs = [document.getElementById("and-left"), document.getElementById("and-right")];
  const andRows = document.getElementById("and-rows");
  const andResult = document.getElementById("and-result");
  const practiceQuestion = document.getElementById("practice-question");
  const practiceAnswer = document.getElementById("practice-answer");
  const practiceFeedback = document.getElementById("practice-feedback");
  const revealButton = document.getElementById("reveal-answer");
  const nextButton = document.getElementById("next-question");

  if (!decimalInput || !binaryOutput || !decimalFromBits || bitButtons.length !== 8) return;

  function clampDecimal(value) {
    const number = Number.parseInt(value, 10);
    if (!Number.isFinite(number)) return null;
    return Math.min(255, Math.max(0, number));
  }

  function bitsFromDecimal(value) {
    return WEIGHTS.map((weight) => (value & weight ? 1 : 0));
  }

  function binaryFromBits(bits) {
    return bits.join("");
  }

  function updateBitButtons(bits) {
    bitButtons.forEach((button, index) => {
      const active = bits[index] === 1;
      button.dataset.active = String(active);
      button.setAttribute("aria-pressed", String(active));
      button.querySelector(".bit-value").textContent = String(bits[index]);
    });
  }

  function updateFromDecimal(value) {
    const number = clampDecimal(value);
    if (number === null) {
      binaryOutput.textContent = "—";
      decimalFromBits.textContent = "—";
      updateBitButtons(Array(8).fill(0));
      return;
    }
    decimalInput.value = String(number);
    const bits = bitsFromDecimal(number);
    binaryOutput.textContent = binaryFromBits(bits);
    decimalFromBits.textContent = String(number);
    updateBitButtons(bits);
  }

  function currentBits() {
    return bitButtons.map((button) => button.dataset.active === "true" ? 1 : 0);
  }

  decimalInput.addEventListener("input", () => updateFromDecimal(decimalInput.value));
  bitButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const bits = currentBits();
      const index = Number(button.dataset.bitIndex);
      bits[index] = bits[index] ? 0 : 1;
      const decimal = bits.reduce((sum, bit, bitIndex) => sum + bit * WEIGHTS[bitIndex], 0);
      decimalInput.value = String(decimal);
      updateFromDecimal(decimal);
    });
  });

  function normalizeBinary(value) {
    const cleaned = value.trim();
    if (!/^[01]{1,8}$/.test(cleaned)) return null;
    return cleaned.padStart(8, "0");
  }

  function renderAnd() {
    const left = normalizeBinary(andInputs[0].value);
    const right = normalizeBinary(andInputs[1].value);
    if (!left || !right) {
      andRows.replaceChildren();
      andResult.textContent = "0と1だけの二進数を8桁以内で入力";
      andResult.dataset.state = "error";
      return;
    }

    const result = [...left].map((bit, index) => Number(bit) & Number(right[index]));
    const fragment = document.createDocumentFragment();
    [left, right, result.join("")].forEach((bits, rowIndex) => {
      const row = document.createElement("div");
      row.className = "and-row";
      const label = document.createElement("span");
      label.className = "and-row-label";
      label.textContent = ["左", "右", "結果"][rowIndex];
      const value = document.createElement("code");
      value.textContent = bits;
      row.append(label, value);
      fragment.appendChild(row);
    });
    andRows.replaceChildren(fragment);
    andResult.textContent = `${left} AND ${right} = ${result.join("")}`;
    andResult.dataset.state = "ok";
  }

  andInputs.forEach((input) => input.addEventListener("input", renderAnd));

  let practiceNumber = 37;

  function renderPractice() {
    practiceQuestion.textContent = `10進数の ${practiceNumber} を、8ビットの二進数に変換してみる`;
    practiceAnswer.hidden = true;
    practiceFeedback.textContent = "まずは 128・64・32・16・8・4・2・1 の重みだけで考える。";
    practiceFeedback.dataset.state = "neutral";
  }

  revealButton.addEventListener("click", () => {
    practiceAnswer.textContent = `正解は ${binaryFromBits(bitsFromDecimal(practiceNumber))}`;
    practiceAnswer.hidden = false;
    practiceFeedback.textContent = `${practiceNumber} = ${bitsFromDecimal(practiceNumber).map((bit, index) => bit ? WEIGHTS[index] : null).filter(Boolean).join(" + ") || "0"}`;
    practiceFeedback.dataset.state = "ok";
  });

  nextButton.addEventListener("click", () => {
    const candidates = [5, 12, 18, 25, 42, 73, 100, 129, 156, 192, 224];
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    practiceNumber = next === practiceNumber ? candidates[(candidates.indexOf(next) + 1) % candidates.length] : next;
    renderPractice();
  });

  updateFromDecimal(decimalInput.value || "0");
  renderAnd();
  renderPractice();
})();
