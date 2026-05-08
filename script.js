const state = {
  quizData: null,
  currentQuiz: null,
  currentQuestionIndex: 0,
  score: 0,
  hasAnswered: false,
  currentCategory: "",
  hasSubmittedAnswer: false,
};

const ui = {
  subjectButtons: document.querySelectorAll(".quiz__subject"),
  playAgainButton: document.querySelector(".quiz__retry"),
  chosenSubjectTexts: document.querySelectorAll(".subject-chosen"),
  chosenSubjectImgs: document.querySelectorAll(".subject-img"),
  screens: {
    menu: document.querySelector(".quiz__screen--menu"),
    game: document.querySelector(".quiz__screen--game"),
    result: document.querySelector(".quiz__screen--result"),
  },

  questionIndex: document.querySelector(".quiz__current-question"),
  questionText: document.querySelector(".quiz__question-text"),
  progress: document.querySelector(".quiz__progress"),

  form: document.querySelector(".quiz__answers"),
  answerInputs: document.querySelectorAll('input[name="answer"]'),
  answerTexts: document.querySelectorAll(".quiz__option-text"),
  error: document.querySelector(".quiz__error-text"),
  errorLogo: document.querySelector(".quiz__error-logo"),
  progressbar: document.querySelector(".quiz__progress"),
  score: document.querySelector(".quiz__score"),
  quizSubmitBtn: document.querySelector(".quiz__submit"),
  answerOptions: document.querySelectorAll(".quiz__option"),
  answerIcons: document.querySelectorAll(".quiz__option-result-icon"),
  submitButton: document.querySelector(".quiz__submit"),
};

const themeToggle = document.querySelector(".theme-switch__input");
const sunIcon = document.querySelector(".theme-toggle img:first-child");
const moonIcon = document.querySelector(".theme-toggle img:last-child");

if (themeToggle) {
  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark";

  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.checked = isDark;

  updateThemeIcons(isDark);

  themeToggle.addEventListener("change", () => {
    const isDark = themeToggle.checked;

    document.body.classList.toggle("dark-theme", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateThemeIcons(isDark);
  });
}

init();

async function init() {
  try {
    const response = await fetch("./data.json");

    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }

    state.quizData = await response.json();

    ui.subjectButtons.forEach((button) => {
      button.addEventListener("click", () => {
        startQuiz(button.dataset.subject);
      });
    });

    ui.form.addEventListener("submit", handleAnswerSubmit);
    ui.playAgainButton.addEventListener("click", resetGame);
  } catch (error) {
    console.error(error);
  }
}

function startQuiz(subject) {
  state.currentQuiz = state.quizData.quizzes.find(
    (quiz) => quiz.title === subject,
  );

  if (!state.currentQuiz) return;

  state.currentQuestionIndex = 0;
  state.score = 0;
  state.hasAnswered = false;
  state.currentCategory = state.currentQuiz.title;
  state.hasSubmittedAnswer = false;
  ui.submitButton.textContent = "Submit Answer";

  showScreen("game");
  renderQuestion();
}

function renderQuestion() {
  clearAnswerStyles();
  const question = getCurrentQuestion();

  ui.progressbar.value = state.currentQuestionIndex + 1;
  ui.chosenSubjectTexts.forEach((elt) => {
    elt.textContent = state.currentCategory;
  });
  switch (state.currentCategory) {
    case "HTML":
      ui.chosenSubjectImgs.forEach((img) => {
        img.src = "../assets/images/icon-html.svg";
        img.alt = "HTLM logo";
      });
      break;
    case "CSS":
      ui.chosenSubjectImgs.forEach((img) => {
        img.src = "../assets/images/icon-css.svg";
        img.alt = "CSS logo";
      });
      break;
    case "JavaScript":
      ui.chosenSubjectImgs.forEach((img) => {
        img.src = "../assets/images/icon-js.svg";
        img.alt = "JS logo";
      });
      break;
    case "Accessibility":
      ui.chosenSubjectImgs.forEach((img) => {
        img.src = "../assets/images/icon-accessibility.svg";
        img.alt = "Accessibility logo";
      });
      break;
  }
  ui.questionIndex.textContent = state.currentQuestionIndex + 1;
  ui.questionText.textContent = question.question;

  ui.progress.value = state.currentQuestionIndex + 1;
  ui.progress.max = state.currentQuiz.questions.length;

  ui.answerTexts.forEach((answerText, index) => {
    answerText.textContent = question.options[index];
  });

  clearSelectedAnswer();
  ui.error.textContent = "";
  ui.errorLogo.hidden = true;
}

function handleAnswerSubmit(event) {
  event.preventDefault();

  if (state.hasSubmittedAnswer) {
    goToNextQuestion();
    return;
  }

  const selectedInput = document.querySelector('input[name="answer"]:checked');

  if (!selectedInput) {
    ui.errorLogo.hidden = false;
    ui.error.textContent = "Please select an answer.";
    return;
  }
  ui.error.textContent = "";
  ui.errorLogo.hidden = true;

  const selectedIndex = Number(selectedInput.value);
  const question = getCurrentQuestion();

  const correctIndex = question.options.findIndex(
    (option) => option === question.answer,
  );

  const isCorrect = selectedIndex === correctIndex;

  if (isCorrect) {
    state.score++;
  }

  showAnswerResult(selectedIndex, correctIndex);

  state.hasSubmittedAnswer = true;
  ui.submitButton.textContent = "Next Question";
}

function showResult() {
  ui.score.textContent = state.score;
  showScreen("result");
}

function resetGame() {
  state.currentQuiz = null;
  state.currentQuestionIndex = 0;
  state.score = 0;
  state.hasSubmittedAnswer = false;
  ui.submitButton.textContent = "Submit Answer";
  clearSelectedAnswer();
  showScreen("menu");
}

function getCurrentQuestion() {
  return state.currentQuiz.questions[state.currentQuestionIndex];
}

function clearSelectedAnswer() {
  ui.answerInputs.forEach((input) => {
    input.checked = false;
  });
}

function showScreen(screenName) {
  Object.entries(ui.screens).forEach(([name, screen]) => {
    screen.hidden = name !== screenName;
  });
}

function showAnswerResult(selectedIndex, correctIndex) {
  ui.answerOptions.forEach((option, index) => {
    const input = option.querySelector("input");

    input.disabled = true;

    if (index === correctIndex) {
      option.classList.add("is-correct");
      ui.answerIcons[index].src = "../assets/images/icon-correct.svg";
      ui.answerIcons[index].hidden = false;
    }

    if (index === selectedIndex && selectedIndex !== correctIndex) {
      option.classList.add("is-wrong");
      ui.answerIcons[index].src = "../assets/images/icon-incorrect.svg";
      ui.answerIcons[index].hidden = false;
    }
  });
}

function goToNextQuestion() {
  const isLastQuestion =
    state.currentQuestionIndex === state.currentQuiz.questions.length - 1;

  if (isLastQuestion) {
    showResult();
    return;
  }

  state.currentQuestionIndex++;
  state.hasSubmittedAnswer = false;
  ui.submitButton.textContent = "Submit Answer";

  clearAnswerStyles();
  renderQuestion();
}

function clearAnswerStyles() {
  ui.answerOptions.forEach((option) => {
    option.classList.remove("is-correct", "is-wrong");

    const input = option.querySelector("input");
    input.checked = false;
    input.disabled = false;
  });

  ui.answerIcons.forEach((icon) => {
    icon.src = "";
    icon.hidden = true;
  });
}

function updateThemeIcons(isDark) {
  sunIcon.src = isDark
    ? "assets/images/icon-sun-light.svg"
    : "assets/images/icon-sun-dark.svg";

  moonIcon.src = isDark
    ? "assets/images/icon-moon-light.svg"
    : "assets/images/icon-moon-dark.svg";
}
