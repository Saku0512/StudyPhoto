document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop(); // 現在のページのファイル名を取得
    const tabs = document.querySelectorAll('.tab a'); // すべてのタブを取得

    tabs.forEach(tab => {
        const tabHref = tab.getAttribute('href').split('/').pop(); // タブのリンクのファイル名を取得
        if (tabHref === currentPage) {
            tab.classList.add('active'); // 現在のページに一致するタブにactiveクラスを追加
        }
    });
});