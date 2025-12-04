// Управление фоновой музыкой
(function () {
  const audio = document.getElementById("background-music");
  const toggleBtn = document.getElementById("music-toggle");
  const musicIcon = document.getElementById("music-icon");
  const musicText = document.getElementById("music-text");

  let isPlaying = false;
  let userInteracted = false;

  // Установка громкости (0.0 - 1.0)
  audio.volume = 0.5;

  // Функция для обновления иконки и текста
  function updateButton() {
    if (isPlaying) {
      musicIcon.textContent = "🔊";
      musicText.textContent = "Музыка";
      toggleBtn.classList.remove("muted");
    } else {
      musicIcon.textContent = "🔇";
      musicText.textContent = "Музыка выключена";
      toggleBtn.classList.add("muted");
    }
  }

  // Функция для воспроизведения музыки
  function playMusic() {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          updateButton();
        })
        .catch((error) => {
          console.log("Автовоспроизведение заблокировано:", error);
          // Показываем подсказку пользователю
          musicText.textContent = "Нажмите для включения";
        });
    }
  }

  // Функция для остановки музыки
  function stopMusic() {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updateButton();
  }

  // Обработчик клика по кнопке
  toggleBtn.addEventListener("click", function () {
    userInteracted = true;
    if (isPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  });

  // Попытка автовоспроизведения при загрузке страницы
  window.addEventListener("load", function () {
    // Небольшая задержка для лучшей совместимости
    setTimeout(function () {
      playMusic();
    }, 500);
  });

  // Обработка событий аудио
  audio.addEventListener("play", function () {
    isPlaying = true;
    updateButton();
  });

  audio.addEventListener("pause", function () {
    isPlaying = false;
    updateButton();
  });

  audio.addEventListener("ended", function () {
    // Если музыка закончилась, перезапускаем (благодаря loop должно быть автоматически)
    isPlaying = false;
    updateButton();
  });

  // Обработка ошибок загрузки
  audio.addEventListener("error", function (e) {
    console.error("Ошибка загрузки аудио:", e);
    musicText.textContent = "Ошибка загрузки";
    toggleBtn.disabled = true;
  });

  // Инициализация кнопки
  updateButton();
})();
