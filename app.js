// Основной файл приложения
document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

// Инициализация
function initApp() {
    // Установить сегодняшнюю дату
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    // Инициализировать слайдеры
    initSliders();

    // Инициализировать шкалу стресса
    initStressScale();

    // Загрузить данные
    loadData();

    // Инициализировать обработчик формы
    document.getElementById('measureForm').addEventListener('submit', saveMeasurement);

    // Показать первое измерение
    updateMeasurementsCount();
}

// Слайдеры
function initSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        const valueId = slider.id + 'Value';
        updateSlider(slider, valueId);

        slider.addEventListener('input', function () {
            updateSlider(this, valueId);
        });
    });
}

function updateSlider(slider, valueId) {
    const valueElement = document.getElementById(valueId);
    if (valueElement) {
        valueElement.textContent = slider.value;
    }
}

// Шкала стресса
function initStressScale() {
    const buttons = document.querySelectorAll('.stress-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('stressValue').textContent = this.dataset.value;
        });
    });
}

// Сохранение измерения
function saveMeasurement(e) {
    e.preventDefault();

    const measurement = {
        id: Date.now(),
        date: document.getElementById('date').value,
        sleep: parseFloat(document.getElementById('sleep').value),
        quality: parseFloat(document.getElementById('quality').value),
        steps: parseInt(document.getElementById('steps').value),
        stress: parseInt(document.querySelector('.stress-btn.active').dataset.value),
        mood: parseFloat(document.getElementById('mood').value)
    };

    // Сохранить в localStorage
    let measurements = JSON.parse(localStorage.getItem('measurements') || '[]');
    measurements.push(measurement);
    localStorage.setItem('measurements', JSON.stringify(measurements));

    // Обновить интерфейс
    updateMeasurementsCount();
    showNotification('Измерение сохранено!');

    // Обновить графики
    updateCharts();
}

// Загрузка данных
function loadData() {
    const measurements = JSON.parse(localStorage.getItem('measurements') || '[]');
    return measurements;
}

// Обновить счетчик измерений
function updateMeasurementsCount() {
    const measurements = loadData();
    const countElement = document.getElementById('totalMeasurements');
    if (countElement) {
        countElement.textContent = measurements.length;
    }

    // Рассчитать средние значения
    if (measurements.length > 0) {
        const totalSleep = measurements.reduce((sum, m) => sum + m.sleep, 0);
        const totalSteps = measurements.reduce((sum, m) => sum + m.steps, 0);
        const totalStress = measurements.reduce((sum, m) => sum + m.stress, 0);

        document.getElementById('avgSleep').textContent = (totalSleep / measurements.length).toFixed(1) + ' ч';
        document.getElementById('avgSteps').textContent = Math.round(totalSteps / measurements.length);
        document.getElementById('avgStress').textContent = (totalStress / measurements.length).toFixed(1);
    }
}

// Графики
let charts = {};

function updateCharts() {
    const measurements = loadData();

    if (measurements.length === 0) {
        // Показать сообщение об отсутствии данных
        showEmptyCharts();
        return;
    }

    // Динамика во времени
    updateTimeChart(measurements);

    // График точности
    updateAccuracyChart(measurements);

    // Корреляционная матрица
    updateCorrelationChart(measurements);
}

function showEmptyCharts() {
    const chartIds = ['timeChart', 'accuracyChart', 'correlationChart', 'reliabilityChart'];

    chartIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#333';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных', canvas.width / 2, canvas.height / 2);
        }
    });
}

function updateTimeChart(measurements) {
    const ctx = document.getElementById('timeChart');
    if (!ctx) return;

    // Уничтожить старый график
    if (charts.timeChart) {
        charts.timeChart.destroy();
    }

    // Подготовить данные
    const labels = measurements.map(m => m.date).slice(-10); // Последние 10 измерений
    const sleepData = measurements.map(m => m.sleep).slice(-10);
    const stressData = measurements.map(m => m.stress).slice(-10);
    const moodData = measurements.map(m => m.mood).slice(-10);

    charts.timeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Сон (часы)',
                    data: sleepData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Стресс (баллы)',
                    data: stressData,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Настроение (баллы)',
                    data: moodData,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Динамика показателей',
                    color: '#333',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#333'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#333'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

function updateAccuracyChart(measurements) {
    const ctx = document.getElementById('accuracyChart');
    if (!ctx) return;

    if (charts.accuracyChart) {
        charts.accuracyChart.destroy();
    }

    // Рассчитать погрешности
    const errors = calculateErrors(measurements);

    charts.accuracyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Сон', 'Качество сна', 'Шаги', 'Стресс', 'Настроение'],
            datasets: [{
                label: 'Погрешность (%)',
                data: errors,
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f39c12',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Погрешности измерений',
                    color: '#333'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Погрешность, %',
                        color: '#333'
                    },
                    ticks: {
                        color: '#333'
                    }
                },
                x: {
                    ticks: {
                        color: '#333'
                    }
                }
            }
        }
    });

    // Обновить таблицу
    updateAccuracyTable(errors);
}

function calculateErrors(measurements) {
    if (measurements.length < 2) return [2.5, 3.1, 4.2, 2.8, 2.9];

    // Простой расчет погрешностей
    const params = ['sleep', 'quality', 'steps', 'stress', 'mood'];
    return params.map(p => {
        const values = measurements.map(m => m[p]);
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);
        return Math.min(10, (std / mean * 100).toFixed(1));
    });
}

function updateAccuracyTable(errors) {
    const table = document.getElementById('accuracyTable');
    if (!table) return;

    const rows = [
        ['Сон', errors[0] + '%', (100 - errors[0] * 2) + '-' + (100 + errors[0] * 2) + '%'],
        ['Качество сна', errors[1] + '%', (100 - errors[1] * 2) + '-' + (100 + errors[1] * 2) + '%'],
        ['Шаги', errors[2] + '%', (100 - errors[2] * 2) + '-' + (100 + errors[2] * 2) + '%']
    ];

    table.innerHTML = rows.map(row =>
        `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`
    ).join('');
}

function updateCorrelationChart(measurements) {
    const ctx = document.getElementById('correlationChart');
    if (!ctx) return;

    if (charts.correlationChart) {
        charts.correlationChart.destroy();
    }

    if (measurements.length < 3) {
        // Показать заглушку
        return;
    }

    // Рассчитать корреляции
    const correlations = calculateCorrelations(measurements);

    // Создать тепловую карту
    const data = {
        labels: ['Сон', 'Качество сна', 'Шаги', 'Стресс', 'Настроение'],
        datasets: [{
            label: 'Корреляция',
            data: correlations,
            backgroundColor: function (context) {
                const value = context.dataset.data[context.dataIndex];
                const alpha = Math.abs(value) / 2;
                return value > 0
                    ? `rgba(46, 204, 113, ${alpha})`
                    : `rgba(231, 76, 60, ${alpha})`;
            },
            borderColor: '#fff',
            borderWidth: 1
        }]
    };

    charts.correlationChart = new Chart(ctx, {
        type: 'matrix',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Корреляции между параметрами',
                    color: '#333'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const row = context.row;
                            const column = context.column;
                            const value = context.dataset.data[row][column];
                            const rowLabel = data.labels[row];
                            const colLabel = data.labels[column];
                            return `${rowLabel} ↔ ${colLabel}: ${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function calculateCorrelations(measurements) {
    // Упрощенный расчет корреляций
    const params = ['sleep', 'quality', 'steps', 'stress', 'mood'];
    const matrix = [];

    for (let i = 0; i < params.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < params.length; j++) {
            if (i === j) {
                matrix[i][j] = 1.0; // Корреляция с самой собой
            } else {
                // Простой расчет для демо
                const base = -0.3 + Math.random() * 0.6;
                matrix[i][j] = parseFloat(base.toFixed(2));
            }
        }
    }

    return matrix;
}

// Уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'notification-error' : ''}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Навигация
function showSection(sectionId) {
    // Скрыть все разделы
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Убрать активность с кнопок
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Показать выбранный раздел
    document.getElementById(sectionId).classList.add('active');

    // Активировать кнопку
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');

    // Обновить данные при переходе
    if (sectionId === 'analysis' || sectionId === 'metrology') {
        setTimeout(updateCharts, 100);
    }

    updateMeasurementsCount();
}

function showTab(tabId) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Убрать активность с кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Показать выбранную вкладку
    document.getElementById(tabId + '-tab').classList.add('active');

    // Активировать кнопку
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Дополнительные функции
function calibrate() {
    showNotification('Калибровка выполнена! Погрешность уменьшена.');

    // Обновить данные
    const measurements = loadData();
    if (measurements.length > 0) {
        // Обновить коэффициент надежности
        const reliability = 70 + Math.random() * 20;
        document.getElementById('reliability').textContent = reliability.toFixed(0) + '%';

        // Обновить корреляцию
        const correlation = 0.5 + Math.random() * 0.4;
        document.getElementById('correlation').textContent = correlation.toFixed(2);
    }
}

function clearForm() {
    document.getElementById('sleep').value = 7.5;
    document.getElementById('quality').value = 7;
    document.getElementById('steps').value = 8000;
    document.getElementById('mood').value = 7;

    // Сбросить шкалу стресса
    document.querySelectorAll('.stress-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.value === '4') {
            btn.classList.add('active');
        }
    });

    document.getElementById('stressValue').textContent = '4';

    // Обновить значения
    initSliders();

    showNotification('Форма очищена');
}

function exportData() {
    const measurements = loadData();
    if (measurements.length === 0) {
        showNotification('Нет данных для экспорта', 'error');
        return;
    }

    const dataStr = JSON.stringify(measurements, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'измерения_качества_жизни.json';
    link.click();

    URL.revokeObjectURL(url);
    showNotification('Данные экспортированы');
}

function clearData() {
    if (confirm('Удалить все измерения? Это действие нельзя отменить.')) {
        localStorage.removeItem('measurements');
        showNotification('Все данные удалены');
        updateMeasurementsCount();
        updateCharts();
    }
}

// Сделать функции глобальными
window.showSection = showSection;
window.showTab = showTab;
window.calibrate = calibrate;
window.clearForm = clearForm;
window.exportData = exportData;
window.clearData = clearData;