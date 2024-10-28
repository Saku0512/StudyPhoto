document.addEventListener('DOMContentLoaded', () => {
  const elapsedSeconds = parseInt(localStorage.getItem('stopwatchTime'), 10) || 0;

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const timeString = 
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0');

  document.getElementById('timer-display').textContent = timeString;
});

function saveStudySession() {
  const category = document.getElementById("category").value;
  const studyTime = document.getElementById("timer-display").textContent;

  const selectedImages = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);

  fetch('../../php/save_study_data.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        category: category,
        study_time: studyTime,
        images: selectedImages
    })
  })
  .then(response => {
    return response.text();
  })
  .then(text => {
    console.log("Response Text:", text);
    try {
        const data = JSON.parse(text);
        if (data.success) {
            alert("保存が完了しました");
        } else {
            alert("エラーが発生しました: " + data.error);
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
        alert("サーバーが正しいレスポンスを返していません。");
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("サーバーエラーが発生しました。詳細はコンソールを確認してください。");
  });
}

document.getElementById('saveButton').addEventListener('click', (event) => {
  event.preventDefault();

  const categorySelect = document.getElementById("category");
  const selectedCategory = categorySelect.value;

  const photoDisplay = document.getElementById("photoDisplay_id");
  const photoSelected = photoDisplay.innerHTML.trim() !== '';

  if (selectedCategory === "--教科を選択--" && !photoSelected) {
    alert("教科を選択してください。");
    return;
  }

  if (!photoSelected) {
    showConfirmPopup();
  } else {
    saveData(); // 必要に応じてリダイレクトをここでも行う
    saveStudySession();
    alert("データが保存されました。");
  }
});

document.getElementById("confirm-save").addEventListener("click", () => {
  hideConfirmPopup();
  saveData();
  saveStudySession();
  alert("データが保存されました。");
});

function showConfirmPopup() {
  document.getElementById("confirm-overlay").style.display = "block";
  document.getElementById("confirm-popup").style.display = "block";
}

function hideConfirmPopup() {
  document.getElementById("confirm-overlay").style.display = "none";
  document.getElementById("confirm-popup").style.display = "none";
}

function saveData() {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];

  const timeString = localStorage.getItem('stopwatchTime') || '00:00:00';
  const parts = timeString.split(':');
  const elapsedSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
  console.log("Saving to record:", timeString);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const totalCurrentHours = hours + minutes / 60 + seconds / 3600;

  const previousTotalTime = parseInt(localStorage.getItem('totalTime')) || 0;

  const newTotalTime = previousTotalTime + totalCurrentHours;
  localStorage.setItem('totalTime', newTotalTime);

  let dates = JSON.parse(localStorage.getItem('dates')) || [];
  let studyTimes = JSON.parse(localStorage.getItem('studyTimes')) || [];

  dates.push(currentDate);
  studyTimes.push(totalCurrentHours);

  localStorage.setItem('dates', JSON.stringify(dates));
  localStorage.setItem('studyTimes', JSON.stringify(studyTimes));

  localStorage.setItem('stopwatchTime', '00:00:00');

  window.location.href = '../../home.php'; // ここでもリダイレクト
}