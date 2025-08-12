const API_URL = "https://gkpg6otc8l.execute-api.eu-north-1.amazonaws.com/count";

const countDisplay = document.getElementById("countDisplay");
const crowdRating = document.getElementById("crowdRating");
const timestampDisplay = document.getElementById("timestampDisplay");
const refreshBtn = document.getElementById("refreshBtn");
const statusMsg = document.getElementById("statusMsg");
const video = document.getElementById("gymPreviewVideo");

// Ensure video is muted (no sound)
video.muted = true;

// Disable default controls
video.controls = false;

// Toggle play/pause on click
video.addEventListener("click", () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});

// Define crowd ranges with labels and Tailwind color classes
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

async function fetchCount() {
  try {
    statusMsg.textContent = "Fetching latest data...";
    statusMsg.style.visibility = "visible";

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch count");

    const data = await res.json();
    const count = data.count ?? 0;

    // Get crowd level based on count
    const level = getCrowdLevel(count);

    // Update count and rating text + colors
    countDisplay.textContent = count;
    countDisplay.className = `font-bold text-7xl mb-4 font-inter ${level.color}`;

    crowdRating.textContent = level.label;
    crowdRating.className = `text-xl font-semibold mb-6 font-inter ${level.color}`;

    timestampDisplay.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

    // Show "Count Refreshed" message, then hide after 3 seconds
    statusMsg.textContent = "Count Refreshed";
    statusMsg.classList.remove("text-red-400");
    statusMsg.classList.add("text-green-400");
    statusMsg.style.visibility = "visible";

    // Clear any previous timers so it doesn't hide prematurely
    if (fetchCount.hideTimeout) clearTimeout(fetchCount.hideTimeout);

    fetchCount.hideTimeout = setTimeout(() => {
      statusMsg.style.visibility = "hidden";
    }, 3000);

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

// Auto-refresh every 20 seconds
setInterval(fetchCount, 20000);

// Fetch initial count on page load
fetchCount();
