const clearAllBtn = document.getElementById('clear-all');

clearAllBtn.addEventListener('click', () => {
  localStorage.clear();
  window.location.reload();
});