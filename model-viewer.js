import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, model, controls;
let autoRotate = false;
let initialCameraPosition = { x: 0, y: 2, z: 5 };

function init() {
  // Создание сцены
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Получение контейнера
  const container = document.getElementById("model-container");

  if (!container) {
    console.error("Контейнер model-container не найден!");
    return;
  }

  // Проверка размеров контейнера
  if (container.clientWidth === 0 || container.clientHeight === 0) {
    console.warn(
      "Контейнер имеет нулевые размеры, используем значения по умолчанию"
    );
  }

  // Создание камеры с правильным aspect ratio контейнера
  const aspect =
    container.clientWidth > 0 && container.clientHeight > 0
      ? container.clientWidth / container.clientHeight
      : 16 / 9;

  camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
  camera.position.set(
    initialCameraPosition.x,
    initialCameraPosition.y,
    initialCameraPosition.z
  );

  // Создание рендерера
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Убеждаемся, что canvas может получать события мыши
  renderer.domElement.style.touchAction = "none";
  renderer.domElement.style.cursor = "grab";

  container.appendChild(renderer.domElement);

  // Освещение
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(5, 10, 5);
  directionalLight1.castShadow = true;
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight2.position.set(-5, 5, -5);
  scene.add(directionalLight2);

  // Контролы для вращения камеры
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 15;
  controls.enablePan = true;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 1.0;
  controls.enableZoom = true;
  controls.enableRotate = true;

  // Изменение курсора при взаимодействии
  controls.addEventListener("start", () => {
    renderer.domElement.style.cursor = "grabbing";
  });
  controls.addEventListener("end", () => {
    renderer.domElement.style.cursor = "grab";
  });

  // Загрузка модели
  const loader = new GLTFLoader();

  // Показываем индикатор загрузки
  const containerElement = document.getElementById("model-container");
  const loadingDiv = document.createElement("div");
  loadingDiv.style.cssText =
    "display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 1.2rem;";
  loadingDiv.textContent = "Загрузка 3D модели...";
  containerElement.appendChild(loadingDiv);

  loader.load(
    "model.glb",
    function (gltf) {
      console.log("Модель успешно загружена!");

      // Удаляем индикатор загрузки
      if (loadingDiv.parentNode) {
        loadingDiv.remove();
      }

      model = gltf.scene;

      // Включение теней для модели
      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Убеждаемся, что материал виден
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                if (mat) mat.needsUpdate = true;
              });
            } else {
              child.material.needsUpdate = true;
            }
          }
        }
      });

      // Вычисление центра модели и масштабирование
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      console.log("Размеры модели:", size);
      console.log("Центр модели:", center);

      // Проверка, что модель имеет размеры
      if (size.x === 0 && size.y === 0 && size.z === 0) {
        console.error("Модель имеет нулевые размеры!");
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText =
          "display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 1.2rem; padding: 20px; text-align: center;";
        errorDiv.innerHTML =
          "Ошибка: Модель имеет нулевые размеры.<br>Проверьте файл model.glb";
        containerElement.appendChild(errorDiv);
        return;
      }

      // Масштабирование модели, чтобы она поместилась в кадр
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      model.scale.multiplyScalar(scale);

      // Центрирование модели
      model.position.sub(center.multiplyScalar(scale));

      scene.add(model);
      console.log("Модель добавлена в сцену");

      // Настройка камеры для лучшего обзора
      const newBox = new THREE.Box3().setFromObject(model);
      const newSize = newBox.getSize(new THREE.Vector3());
      const newCenter = newBox.getCenter(new THREE.Vector3());

      const distance = Math.max(newSize.x, newSize.y, newSize.z) * 2;
      camera.position.set(
        newCenter.x,
        newCenter.y + distance * 0.3,
        newCenter.z + distance * 0.7
      );
      camera.lookAt(newCenter);
      controls.target.copy(newCenter);
      controls.update();

      console.log("Камера настроена. Позиция:", camera.position);
      console.log("Цель камеры:", controls.target);
    },
    function (xhr) {
      const percent = (xhr.loaded / xhr.total) * 100;
      console.log(percent.toFixed(2) + "% загружено");
      if (loadingDiv) {
        loadingDiv.textContent = `Загрузка: ${percent.toFixed(0)}%`;
      }
    },
    function (error) {
      console.error("Ошибка загрузки модели:", error);
      if (loadingDiv.parentNode) {
        loadingDiv.remove();
      }
      const container = document.getElementById("model-container");
      container.innerHTML =
        '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white; font-size: 1.2rem; padding: 20px; text-align: center; background: rgba(0,0,0,0.5);">' +
        '<h3 style="margin-bottom: 20px;">Ошибка загрузки 3D модели</h3>' +
        '<p style="margin-bottom: 15px;">Убедитесь, что файл model.glb находится в корне проекта.</p>' +
        '<p style="margin-bottom: 15px;"><strong>Важно:</strong> Для работы с локальными файлами необходимо использовать локальный веб-сервер!</p>' +
        '<div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px; margin-top: 10px;">' +
        '<p style="margin-bottom: 10px;">Запустите в терминале:</p>' +
        '<code style="background: rgba(0,0,0,0.3); padding: 10px; display: block; border-radius: 3px; font-size: 0.9rem;">python3 -m http.server 8000</code>' +
        '<p style="margin-top: 10px; font-size: 0.9rem;">Затем откройте: <code>http://localhost:8000</code></p>' +
        "</div>" +
        "</div>";
    }
  );

  // Обработка изменения размера окна
  window.addEventListener("resize", onWindowResize, false);

  // Кнопки управления
  document.getElementById("reset-view").addEventListener("click", resetView);
  document
    .getElementById("auto-rotate")
    .addEventListener("click", toggleAutoRotate);

  // Анимация
  animate();
}

function onWindowResize() {
  const container = document.getElementById("model-container");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function resetView() {
  if (model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const distance = Math.max(size.x, size.y, size.z) * 2;

    camera.position.set(
      center.x,
      center.y + distance * 0.3,
      center.z + distance * 0.7
    );
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
  }
}

function toggleAutoRotate() {
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;
  const button = document.getElementById("auto-rotate");
  button.textContent = autoRotate ? "Остановить поворот" : "Автоповорот";
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Инициализация после загрузки страницы
window.addEventListener("load", () => {
  // Небольшая задержка для гарантии, что DOM полностью готов
  setTimeout(init, 100);
});
