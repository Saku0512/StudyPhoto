//カレント表示
const links = document.querySelectorAll(".header-nav_item > a");

links.forEach(function(link) {
  if(link.href === location.href){
    link.closest(".header-nav_item").classList.add("current");
  }
});