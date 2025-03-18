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
        }
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