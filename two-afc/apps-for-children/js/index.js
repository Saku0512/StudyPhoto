document.querySelectorAll('.text input, .text textarea').forEach(function (element) {
    element.addEventListener('keyup', handleEvent);
    element.addEventListener('blur', handleEvent);
    element.addEventListener('focus', handleEvent);
});

function handleEvent(e) {
    var label = this.previousElementSibling;
    
    if (e.type === 'keyup') {
        if (this.value === '') {
            label.classList.remove('active', 'highlight');
        } else {
            label.classList.add('active', 'highlight');
        }
    } else if (e.type === 'blur') {
        if (this.value === '') {
            label.classList.remove('active', 'highlight');
        } else {
            label.classList.remove('highlight');
        }
    } else if (e.type === 'focus') {
        if (this.value === '') {
            label.classList.remove('highlight');
        } else {
            label.classList.add('highlight');
        }
    }
}

// タブのクリックイベント
document.querySelectorAll('.tab a').forEach(function (tab) {
    tab.addEventListener('click', function (e) {
        e.preventDefault();

        var parent = this.parentElement;
        parent.classList.add('active');

        parent.parentElement.querySelectorAll('.active').forEach(function (sibling) {
            if (sibling !== parent) sibling.classList.remove('active');
        });

        var target = document.querySelector(this.getAttribute('href'));

        document.querySelectorAll('.tab-content > div').forEach(function (content) {
            if (content !== target) content.style.display = 'none';
        });

        target.style.display = 'block';
        target.style.opacity = 0;
        setTimeout(() => {
            target.style.transition = 'opacity 0.6s';
            target.style.opacity = 1;
        }, 10);
    });
});