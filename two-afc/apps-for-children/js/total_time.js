let categories = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
    fetchCategories();
    addEventListeners();
}

// カテゴリーを取得
function fetchCategories() {
    fetch("../../php/record/fetch_categories.php")
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
}

// カテゴリーの表示を更新
function updateCategory() {
    if (categories.length > 0) {
        const selectedCategory = categories[currentIndex];
        document.querySelector(".total_span_select_text").textContent = selectedCategory;
        updateTotalStudyTime(selectedCategory);
        updateTotalStudyCount(selectedCategory);
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
            document.querySelector(".total_time_text_hour").textContent = data.hours;
            document.querySelector(".total_time_text_min").textContent = data.minutes;
        })
        .catch(error => console.error("Fetch Error:", error));
}

// 合計学習回数を取得＆更新
function updateTotalStudyCount(category) {
    fetch(`../../php/record/total_study_count.php?category=${encodeURIComponent(category)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error:", data.error);
                return;
            }
            const countElement = document.querySelector(".total_count_text");
            if (countElement) {
                countElement.textContent = `${data.study_count}`;
            } else {
                console.error("Element not found!");
            }
        })
        .catch(error => console.error("Fetch Error:", error));
}

// イベントリスナーの追加
function addEventListeners() {
    document.querySelector(".total_span_select_right").addEventListener("click", nextCategory);
    document.querySelector(".total_span_select_left").addEventListener("click", prevCategory);
}

// 次のカテゴリーへ
function nextCategory() {
    if (categories.length > 0) {
        currentIndex = (currentIndex + 1) % categories.length;
        updateCategory();
    }
}

// 前のカテゴリーへ
function prevCategory() {
    if (categories.length > 0) {
        currentIndex = (currentIndex - 1 + categories.length) % categories.length;
        updateCategory();
    }
}