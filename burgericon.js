// Burger Icon 
function toggleMenu() {
  const navMain = document.querySelector('.nav-main');
  const burgerIcon = document.querySelector('.burger i');

  navMain.classList.toggle('active');

  // change icon: bars ↔ X
  if (burgerIcon.classList.contains('fa-bars')) {
    burgerIcon.classList.remove('fa-bars');
    burgerIcon.classList.add('fa-times');
  } else {
    burgerIcon.classList.remove('fa-times');
    burgerIcon.classList.add('fa-bars');
  }
}