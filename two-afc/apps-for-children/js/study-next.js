document.addEventListener('DOMContentLoaded', () => {
  // localStorage から保存された秒数を取得
  const elapsedSeconds = parseInt(localStorage.getItem('stopwatchTime'), 10) || 0;
  //console.log(elapsedSeconds); // デバッグ用

  // 秒を時間：分：秒形式に変換
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  //表示用のテキストを作成
  const timeString = 
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0');

    // 表示
  document.getElementById('timer-display').textContent = timeString;
});

export function saveStudySession() {
  const category = document.getElementById("category").value;
  const studyTime = document.getElementById("timer-display").textContent;
  const selectdImages = []; // 選択した画像のリスト
  const username = document.getElementById("username").value;

  // ここで選択した画像の情報を取得する処理を追加する

  // AJAXリクエストを送信
  fetch('../../php/save_study_data.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          username: username,
          category: category,
          study_time: studyTime,
          images: selectdImages
      })
  })
  .then(response => response.json())
  .then(data => {
      if(data.success) {
          alert("保存が完了しました");
      }else{
          alert("エラーが発生しました");
      }
  })
  .catch(error => console.error("Error:", error));
}

document.getElementById('saveButton').addEventListener('click', (event) => {
  event.preventDefault();
  //console.log("Save button clicked"); // デバッグ用

  const categorySelect = document.getElementById("category");
  const selectedCategory = categorySelect.value;
  //console.log("Selected Category:",selectedCategory); // デバッグ用

  const photoDisplay = document.getElementById("photoDisplay_id");
  const photoSelected = photoDisplay.innerHTML.trim() !== ''; // 画像を選択しているかどうか
  //console.log("Photo Selected:", photoSelected); // デバッグ用

  // 教科が選択されていない場合は、画像ポップアップは表示せず教科アラートを表示
  if(selectedCategory === "--教科を選択--" && !photoSelected) {
    alert("教科を選択してください。");
    return;
  }
  saveStudySession();

  if(!photoSelected) {
    showConfirmPopup();
  } else {
    saveData();
    window.location.href = '../../home.php';
  }
});

document.getElementById("confirm-save").addEventListener("click", () => {
  hideConfirmPopup();
  saveData();
});

function showConfirmPopup() {
  document.getElementById("confirm-overlay").style.display = "block";
  document.getElementById("confirm-popup").style.display = "block";
}

function hideConfirmPopup() {
  document.getElementById("confirm-overlay").style.display = "none";
  document.getElementById("confirm-popup").style.display = "none";
}

/*************  ✨ Codeium Command ⭐  *************/
  /**
   * 保存ボタンが押されたら、現在の日付と現在の Study Time を localStorage に保存。
   * また、既存の totalTime を取得し、新しい Study Time を加算して保存。
   * 最後に、タイマーをリセット。
   */
function saveData() {
  // 現在の日付を取得し、YYYY-MM-DD形式で保存
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD形式

  // 保存する時間を取得
  const timeString = localStorage.getItem('stopwatchTime') || '00:00:00';
  console.log("Saving to record:", timeString); // デバッグ用

  const elapsedSeconds = parseInt(timeString, 10) || 0;
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const totalCurrentHours = hours + minutes / 60 + seconds / 3600;

  // 既存の totalTime を取得（なければ 0 を使用）
  const previousTotalTime = parseInt(localStorage.getItem('totalTime')) || 0;

  const newTotalTime = previousTotalTime + totalCurrentHours;
  localStorage.setItem('totalTime', newTotalTime);

  // 現在の日付と時間を保存
  let dates = JSON.parse(localStorage.getItem('dates')) || [];
  let studyTimes = JSON.parse(localStorage.getItem('studyTimes')) || [];

  dates.push(currentDate);
  studyTimes.push(totalCurrentHours);

  localStorage.setItem('dates', JSON.stringify(dates));
  localStorage.setItem('studyTimes', JSON.stringify(studyTimes));

  // タイマーをリセット
  localStorage.setItem('stopwatchTime', '00:00:00');

  window.location.href = '../../home.php';
};