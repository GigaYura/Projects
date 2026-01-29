// В конструкторе ResearchCharts добавьте опции для текста
class ResearchCharts {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#3498db',
            secondary: '#2ecc71',
            accent: '#e74c3c',
            warning: '#f39c12',
            success: '#27ae60',
            gray: '#95a5a6'
        };

        // Общие настройки для всех графиков
        this.chartOptions = {
            fontColor: '#000000', // Черный цвет текста
            fontSize: 14
        };
    }

    // Обновите метод showEmptyChartMessage:
    showEmptyChartMessage(chartId, message) {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = 'bold 16px Arial, sans-serif';
            ctx.fillStyle = '#000000'; // Черный цвет
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        }
    }

    // В каждом методе создания графика добавьте настройки цвета текста:
    // Например, в initializeAccuracyChart:
    initializeAccuracyChart() {
        // ... существующий код ...

        options: {
            responsive: true,
                maintainAspectRatio: false,
                    plugins: {
                title: {
                    display: true,
                        text: 'Погрешности измерений по параметрам (%)',
                            font: {
                        size: 16,
                            weight: 'bold'
                    },
                    color: '#000000' // Черный цвет заголовка
                },
                legend: {
                    labels: {
                        color: '#000000', // Черный цвет легенды
                            font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                        title: {
                        display: true,
                            text: 'Погрешность, %',
                                color: '#000000' // Черный цвет подписи оси
                    },
                    ticks: {
                        color: '#000000' // Черный цвет делений
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                            text: 'Параметры измерения',
                                color: '#000000'
                    },
                    ticks: {
                        color: '#000000'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    }
}