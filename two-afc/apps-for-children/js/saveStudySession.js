function saveStudySession() {
    const category = document.getElementById("category").value;
    const studyTime = document.getElementById("timer-display").textContent;
    const selectdImages = []; // 選択した画像のリスト

    // ここで選択した画像の情報を取得する処理を追加する

    // AJAXリクエストを送信
    fetch('../php/save_study_data.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: '<php echo $_SESSION["username"]; ?>',
            category: category,
            study_time: studyTime,
            images: selectdImages
        })
    })
    .then(Response => Response.json())
    .then(data => {
        if(data.success) {
            alert("保存が完了しました");
        }else{
            alert("エラーが発生しました");
        }
    })
    .catch(error => console.error("Error:", error));
}