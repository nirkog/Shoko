const cancelBtn = document.querySelector('.cancel-btn');
const alertContainer = document.querySelector('.alert-container');

cancelBtn.addEventListener('click', (e) => {
    alertContainer.style.opacity = 0;
});