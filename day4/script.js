const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

function updateCounts() {
  const text = noteText.value;

  const characters = text.length;

  const words = text.trim() === ""
    ? 0
    : text.trim().split(/\s+/).length;

  charCount.textContent = `${characters} / 200 characters`;
  wordCount.textContent = `${words} words`;

  charCount.classList.remove("warning", "over");

  if (characters > 200) {
    charCount.classList.add("over");
  } else if (characters > 180) {
    charCount.classList.add("warning");
  }
}

const savedDraft = localStorage.getItem("quicknotes-draft");

if (savedDraft !== null) {
  noteText.value = savedDraft;
}

noteText.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem("quicknotes-draft", noteText.value);
});

updateCounts();

function clearNote() {
  noteText.value = "";
  localStorage.removeItem("quicknotes-draft");
  updateCounts();
}

clearBtn.addEventListener("click", clearNote);

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearNote();
  }
});

function updateThemeButton() {
  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "Light mode";
  } else {
    themeToggle.textContent = "Dark mode";
  }
}
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  localStorage.setItem("quicknotes-theme", isDark ? "dark" : "light");

  updateThemeButton();
});
const savedTheme = localStorage.getItem("quicknotes-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

updateThemeButton();