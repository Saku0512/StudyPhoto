let timePassed = 0;
let stopwatchId = null;
let isRunning = false;

const timerElement = $("#circleTimer");
const timerText = $("#timerText");
const toggleButton = $("#toggleButton");
const endButton = $("#endButton");

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateStopwatch() {
  timePassed++;
  const percentage = (timePassed / 3600) * 100; // Limit to one hour for demonstration
  timerElement.css("--percentage", `${percentage}%`);
  timerText.html(formatTime(timePassed));
  stopwatchId = setTimeout(updateStopwatch, 1000);
}

function startStopwatch() {
  isRunning = true;
  toggleButton.html("ストップ");
  updateStopwatch();
}

function stopStopwatch() {
  isRunning = false;
  clearTimeout(stopwatchId);
  toggleButton.html("スタート");
}

toggleButton.on('click', () => {
  if (isRunning) {
    stopStopwatch();
  } else {
    startStopwatch();
  }
});

endButton.on('click', () => {
  stopStopwatch();
  localStorage.setItem('stopwatchTime', formatTime(timePassed));
  window.location.href = 'study-next.html';
});
