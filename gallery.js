// Управление галереей изображений
function openModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  modal.style.display = "block";
  modalImg.src = imageSrc;
  // Предотвращаем закрытие при клике на само изображение
  modalImg.onclick = function (e) {
    e.stopPropagation();
  };
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
}

// Закрытие модального окна по нажатию Escape
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});
