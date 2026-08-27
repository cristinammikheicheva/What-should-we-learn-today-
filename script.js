/* ==========================================
   1. ANIMATED FOREST BACKGROUND (Isolated)
   ========================================== */
(function initForestAnimation() {
  function startCanvas() {
    const canvas = document.getElementById("forest-canvas");
    if (!canvas) return setTimeout(startCanvas, 50);

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    class Leaf {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * width;
        this.y = -20;
        this.size = Math.random() * 8 + 6;
        this.speedY = Math.random() * 1.2 + 0.6;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = Math.random() * 0.04 - 0.02;
        this.opacity = Math.random() * 0.5 + 0.4;
      }
      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.02) + this.speedX;
        this.angle += this.spin;
        if (this.y > height + 20) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = `rgba(149, 213, 178, ${this.opacity})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const leaves = Array.from({ length: 45 }, () => new Leaf());

    function drawTrees() {
      ctx.fillStyle = "rgba(10, 30, 15, 0.45)";
      for (let i = -20; i < width + 40; i += 70) {
        const treeHeight = 160 + Math.sin(i * 0.05) * 50;
        ctx.beginPath();
        ctx.moveTo(i, height);
        ctx.lineTo(i + 35, height - treeHeight);
        ctx.lineTo(i + 70, height);
        ctx.fill();
      }
    }

    function animateForest() {
      ctx.clearRect(0, 0, width, height);
      drawTrees();
      leaves.forEach((leaf) => {
        leaf.update();
        leaf.draw();
      });
      requestAnimationFrame(animateForest);
    }

    animateForest();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startCanvas);
  } else {
    startCanvas();
  }
})();

/* ==========================================
   2. APP LOGIC & STORAGE
   ========================================== */
const defaultIdeas = [
  { text: "Plant Identification & Foraging Basics", category: "Science & Nature", count: 0 },
  { text: "Python Data Structures", category: "Tech & Coding", count: 0 },
  { text: "Basic Conversational Spanish", category: "Languages", count: 0 },
  { text: "Acoustic Guitar Chords", category: "Arts & Music", count: 0 },
  { text: "Essential Outdoor Knots", category: "Life Skills", count: 0 }
];

let dateIdeas = JSON.parse(localStorage.getItem("learningIdeas")) || defaultIdeas;
let completedIdeas = JSON.parse(localStorage.getItem("completedLearningIdeas")) || [];
let studyLog = JSON.parse(localStorage.getItem("studyLogDateMap")) || {};
let currentIdea = null;

const ideaDisplay = document.getElementById("idea-display");
const generateBtn = document.getElementById("generate-btn");
const studyCountBtn = document.getElementById("study-count-btn");
const markDoneBtn = document.getElementById("mark-done-btn");
const categoryFilter = document.getElementById("category-filter");
const addIdeaForm = document.getElementById("add-idea-form");
const newIdeaInput = document.getElementById("new-idea-input");
const newCategorySelect = document.getElementById("new-category-select");
const historyList = document.getElementById("history-list");
const historyCount = document.getElementById("history-count");

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function saveData() {
  localStorage.setItem("learningIdeas", JSON.stringify(dateIdeas));
  localStorage.setItem("completedLearningIdeas", JSON.stringify(completedIdeas));
  localStorage.setItem("studyLogDateMap", JSON.stringify(studyLog));
}

function logSessionDate() {
  const today = getTodayKey();
  studyLog[today] = (studyLog[today] || 0) + 1;
  saveData();
  if (typeof updateChart === "function") updateChart();
}

function renderHistory() {
  if (!historyList) return;
  historyList.innerHTML = "";
  completedIdeas.forEach((idea) => {
    const li = document.createElement("li");
    const title = typeof idea === "string" ? idea : idea.text;
    const countText = idea.count ? ` [Studied ${idea.count}x]` : "";
    const categoryText = idea.category ? ` (${idea.category})` : "";
    li.textContent = title + countText + categoryText;
    historyList.appendChild(li);
  });
  if (historyCount) historyCount.textContent = completedIdeas.length;
}

function displayCurrentTopic() {
  if (!ideaDisplay || !currentIdea) return;
  ideaDisplay.innerHTML = "";
  if (currentIdea.category) {
    const badge = document.createElement("span");
    badge.className = "category-badge";
    badge.textContent = currentIdea.category;
    ideaDisplay.appendChild(badge);
  }
  const textSpan = document.createElement("span");
  textSpan.textContent = currentIdea.text;
  ideaDisplay.appendChild(textSpan);

  const trackerSpan = document.createElement("span");
  trackerSpan.className = "study-tracker";
  trackerSpan.textContent = `Times Studied: ${currentIdea.count || 0}`;
  ideaDisplay.appendChild(trackerSpan);
}

if (generateBtn) {
  generateBtn.addEventListener("click", () => {
    const selectedCategory = categoryFilter ? categoryFilter.value : "All";
    const filteredPool =
      selectedCategory === "All"
        ? dateIdeas
        : dateIdeas.filter((item) => item.category === selectedCategory);

    if (filteredPool.length === 0) {
      ideaDisplay.textContent = `No remaining topics in "${selectedCategory}"!`;
      if (markDoneBtn) markDoneBtn.classList.add("hidden");
      if (studyCountBtn) studyCountBtn.classList.add("hidden");
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredPool.length);
    currentIdea = filteredPool[randomIndex];
    if (typeof currentIdea.count === "undefined") currentIdea.count = 0;

    displayCurrentTopic();
    if (markDoneBtn) markDoneBtn.classList.remove("hidden");
    if (studyCountBtn) studyCountBtn.classList.remove("hidden");
  });
}

if (studyCountBtn) {
  studyCountBtn.addEventListener("click", () => {
    if (!currentIdea) return;
    currentIdea.count = (currentIdea.count || 0) + 1;
    logSessionDate();
    displayCurrentTopic();
  });
}

if (markDoneBtn) {
  markDoneBtn.addEventListener("click", () => {
    if (!currentIdea) return;
    dateIdeas = dateIdeas.filter((idea) => idea.text !== currentIdea.text);
    completedIdeas.push(currentIdea);
    logSessionDate();
    renderHistory();
    ideaDisplay.textContent = `Mastered! Pick another?`;
    markDoneBtn.classList.add("hidden");
    studyCountBtn.classList.add("hidden");
    currentIdea = null;
  });
}

if (addIdeaForm) {
  addIdeaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userText = newIdeaInput.value.trim();
    const userCategory = newCategorySelect.value;
    if (userText) {
      dateIdeas.push({ text: userText, category: userCategory, count: 0 });
      saveData();
      ideaDisplay.textContent = `Added: "${userText}"!`;
      newIdeaInput.value = "";
    }
  });
}

renderHistory();

/* ==========================================
   3. CHART SETUP WITH TIMEFRAMES
   ========================================== */
let studyChart = null;

function updateChart() {
  if (!studyChart) return;
  const timeframeSelect = document.getElementById("timeframe-select");
  const selectedTimeframe = timeframeSelect ? timeframeSelect.value : "7days";
  
  const dateRange = getDateRange(selectedTimeframe);
  studyChart.data.labels = dateRange.map((day) => {
    const p = day.split("-");
    return `${p[1]}/${p[2]}`;
  });
  studyChart.data.datasets[0].data = dateRange.map((day) => studyLog[day] || 0);
  studyChart.update();
}

function getDateRange(timeframe) {
  const dates = [];
  const today = new Date();

  if (timeframe === "alltime") {
    const loggedDates = Object.keys(studyLog).sort();
    if (loggedDates.length === 0) {
      return [today.toISOString().split("T")[0]];
    }
    const startDate = new Date(loggedDates[0]);
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }

  let daysToSubtract = 7;
  if (timeframe === "month") daysToSubtract = 30;
  if (timeframe === "3months") daysToSubtract = 90;
  if (timeframe === "6months") daysToSubtract = 180;
  if (timeframe === "year") daysToSubtract = 365;

  for (let i = daysToSubtract - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function initChart() {
  const chartCanvas = document.getElementById("studyChart");
  if (!chartCanvas || typeof Chart === "undefined") return;

  const ctxChart = chartCanvas.getContext("2d");
  studyChart = new Chart(ctxChart, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Sessions",
          data: [],
          backgroundColor: "#40916c",
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      },
      plugins: { legend: { display: false } }
    }
  });

  const timeframeSelect = document.getElementById("timeframe-select");
  if (timeframeSelect) {
    timeframeSelect.addEventListener("change", updateChart);
  }
  updateChart();
}

// Initialize Chart safely
if (typeof Chart !== "undefined") {
  initChart();
} else {
  window.addEventListener("load", initChart);
}
