const API_URL = "https://gkpg6otc8l.execute-api.eu-north-1.amazonaws.com/count";

const countDisplay = document.getElementById("countDisplay");
const crowdRating = document.getElementById("crowdRating");
const timestampDisplay = document.getElementById("timestampDisplay");
const refreshBtn = document.getElementById("refreshBtn");
const statusMsg = document.getElementById("statusMsg");
const video = document.getElementById("gymPreviewVideo");

// Create Ladies Only banner element
const ladiesOnlyBanner = document.createElement("div");
ladiesOnlyBanner.id = "ladiesOnlyBanner";
ladiesOnlyBanner.className = "hidden text-pink-500 font-bold text-2xl mb-2 font-inter";
ladiesOnlyBanner.textContent = "Currently Ladies Only";
timestampDisplay.parentNode.insertBefore(ladiesOnlyBanner, timestampDisplay); 

// -----------------------------
// NEW: toggle for maintenance
// -----------------------------
const IS_MAINTENANCE = true; 

// Ensure video is muted
video.muted = true;
video.controls = false;

// Toggle play/pause
video.addEventListener("click", () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});

const crowdLevels = [
  { max: 5, label: "Empty", color: "text-green-400" },
  { max: 15, label: "Considered Empty", color: "text-lime-400" },
  { max: 30, label: "Moderate", color: "text-yellow-400" },
  { max: 45, label: "Crowded", color: "text-orange-500" },
  { max: Infinity, label: "Very Crowded", color: "text-red-500" },
];

function getCrowdLevel(count) {
  return crowdLevels.find(level => count <= level.max);
}

// -----------------------------
// Ladies Only Time Checker
// -----------------------------
// 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, ...
function isLadiesOnly() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  // Monday 12pm–3pm
  if (day === 1 && hour >= 12 && hour < 15) return true;

  // Tuesday 6pm–8pm
  if (day === 2 && hour >= 18 && hour < 20) return true;

  // Wednesday 12pm–3pm
  if (day === 3 && hour >= 12 && hour < 15) return true;

  return false;
}

async function fetchCount() {
  try {
    statusMsg.textContent = "Fetching latest data...";
    statusMsg.style.visibility = "visible";

    // -----------------------------
    // Handle Maintenance Mode
    // -----------------------------
    if (IS_MAINTENANCE) {
      countDisplay.textContent = ""; 
      countDisplay.className = "font-bold text-7xl mb-4 font-inter text-gray-400";

      crowdRating.textContent = "Closed for Maintenance"; 
      crowdRating.className = "text-xl font-semibold mb-6 font-inter text-red-400";

      timestampDisplay.textContent = `Reopen time: TBD`;

      statusMsg.textContent = "App is under maintenance";
      statusMsg.classList.remove("text-green-400");
      statusMsg.classList.add("text-red-400");
      statusMsg.style.visibility = "visible";

      ladiesOnlyBanner.classList.add("hidden"); 
      refreshBtn.classList.remove("bg-pink-500", "hover:bg-pink-600");
      refreshBtn.classList.add("bg-gray-700", "hover:bg-gray-800");
      return;
    }

    // -----------------------------
    // Handle Normal Closed Hours
    // -----------------------------
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 6) {
      countDisplay.textContent = ""; 
      countDisplay.className = "font-bold text-7xl mb-4 font-inter text-gray-400";

      crowdRating.textContent = "Closed";
      crowdRating.className = "text-xl font-semibold mb-6 font-inter text-gray-400";

      timestampDisplay.textContent = `Opens at 6 AM`;

      statusMsg.textContent = "Gym is currently closed";
      statusMsg.classList.remove("text-green-400");
      statusMsg.classList.add("text-red-400");
      statusMsg.style.visibility = "visible";

      ladiesOnlyBanner.classList.add("hidden"); 
      refreshBtn.classList.remove("bg-pink-500", "hover:bg-pink-600");
      refreshBtn.classList.add("bg-gray-700", "hover:bg-gray-800");
      return;
    }

    // -----------------------------
    // Otherwise fetch live count
    // -----------------------------
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch count");

    const data = await res.json();
    const count = data.count ?? 0;

    const level = getCrowdLevel(count);

    countDisplay.textContent = count;
    countDisplay.className = `font-bold text-7xl mb-4 font-inter ${level.color}`;

    crowdRating.textContent = level.label;
    crowdRating.className = `text-xl font-semibold mb-6 font-inter ${level.color}`;

    timestampDisplay.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

    statusMsg.textContent = "Count Refreshed";
    statusMsg.classList.remove("text-red-400");
    statusMsg.classList.add("text-green-400");
    statusMsg.style.visibility = "visible";

    if (fetchCount.hideTimeout) clearTimeout(fetchCount.hideTimeout);
    fetchCount.hideTimeout = setTimeout(() => {
      statusMsg.style.visibility = "hidden";
    }, 3000);

    // -----------------------------
    // Ladies Only Mode Styling
    // -----------------------------
    if (isLadiesOnly()) {
      ladiesOnlyBanner.classList.remove("hidden");
      refreshBtn.classList.remove("bg-gray-700", "hover:bg-gray-800");
      refreshBtn.classList.add("bg-pink-500", "hover:bg-pink-600");
    } else {
      ladiesOnlyBanner.classList.add("hidden");
      refreshBtn.classList.remove("bg-pink-500", "hover:bg-pink-600");
      refreshBtn.classList.add("bg-gray-700", "hover:bg-gray-800");
    }

  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Error fetching data.";
    statusMsg.classList.remove("text-green-400");
    statusMsg.classList.add("text-red-400");
    statusMsg.style.visibility = "visible";

    if (fetchCount.hideTimeout) clearTimeout(fetchCount.hideTimeout);
  }
}

refreshBtn.addEventListener("click", fetchCount);
setInterval(fetchCount, 20000);
fetchCount();

