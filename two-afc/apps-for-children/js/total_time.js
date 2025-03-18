let categories = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", function () {
    // カテゴリーを取得
    fetch("../../php/record/total_time.php")
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error:", data.error);
                return;
            }
            categories = data.map(cat => cat.category_name);
            
            if (categories.length > 0) {
                updateCategory();
            } else {
                console.warn("Warning: カテゴリーのデータがありません。");
            }
        })
        .catch(error => console.error("Fetch Error:", error));

    // カテゴリーの表示を更新
    function updateCategory() {
        if (categories.length > 0) {
            document.querySelector(".total_span_select_text").textContent = categories[currentIndex];
            updateTotalStudyTime(categories[currentIndex]); // 合計時間を更新
            updateTotalStudyCount(categories[currentIndex]); // 合計学習回数を更新
        }
    }

    // 合計時間を取得＆更新
    function updateTotalStudyTime(category) {
        fetch(`../../php/record/total_study_time.php?category=${encodeURIComponent(category)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error:", data.error);
                    return;
                }
                console.log("Fetched Data:", data);
                document.querySelector(".total_time_text_hour").textContent = data.hours;
                document.querySelector(".total_time_text_min").textContent = data.minutes;
            })
            .catch(error => console.error("Fetch Error:", error));
    }

    // 合計学習回数を取得＆更新
    function updateTotalStudyCount(category) {
        console.log("Fetching study count for:", category);
    
        fetch(`../../php/record/total_study_count.php?category=${encodeURIComponent(category)}`)
            .then(response => response.json())
            .then(data => {
                console.log("Fetched Data:", data);
    
                if (data.error) {
                    console.error("Error:", data.error);
                    return;
                }
    
                let countElement = document.querySelector(".total_count_text");
    
                if (!countElement) {
                    console.error("Element not found!");
                    return;
                }
    
                countElement.textContent = `${data.study_count}`;
            })
            .catch(error => console.error("Fetch Error:", error));
    }

    // 右矢印（次のカテゴリーへ）
    document.querySelector(".total_span_select_right").addEventListener("click", function () {
        if (categories.length > 0) {
            currentIndex = (currentIndex + 1) % categories.length;
            updateCategory();
        }
    });

    // 左矢印（前のカテゴリーへ）
    document.querySelector(".total_span_select_left").addEventListener("click", function () {
        if (categories.length > 0) {
            currentIndex = (currentIndex - 1 + categories.length) % categories.length;
            updateCategory();
        }
    });
});