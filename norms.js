// Нормативные значения и стандарты

class QualityOfLifeNorms {
    constructor() {
        // Нормы Всемирной организации здравоохранения (ВОЗ)
        this.whoNorms = {
            sleep: {
                ageGroups: {
                    '13-17': { min: 8, max: 10, optimal: 9 },
                    '18-25': { min: 7, max: 9, optimal: 8 },
                    '26-64': { min: 7, max: 9, optimal: 8 },
                    '65+': { min: 7, max: 8, optimal: 7.5 }
                },
                unit: 'часы',
                source: 'ВОЗ, 2020',
                comment: 'Рекомендации по продолжительности сна'
            },

            physicalActivity: {
                steps: {
                    minimum: 8000,
                    recommended: 10000,
                    optimal: 12000,
                    active: 15000
                },
                moderateActivity: {
                    minutesPerWeek: 150,
                    sessionsPerWeek: 5
                },
                unit: 'шаги/день',
                source: 'ВОЗ, 2020',
                comment: 'Минимальный уровень физической активности'
            },

            nutrition: {
                fruitsVegetables: {
                    minimum: 400, // граммы
                    portions: 5,
                    optimal: 600
                },
                water: {
                    litersPerDay: 2.0,
                    glassesPerDay: 8
                },
                unit: 'порции/день',
                source: 'ВОЗ, 2020',
                comment: 'Рекомендации по здоровому питанию'
            },

            screenTime: {
                children: {
                    '2-5': { max: 1 },
                    '6-12': { max: 2 },
                    '13-18': { max: 2 }
                },
                adults: {
                    recreational: { max: 2 },
                    total: { max: 6 }
                },
                unit: 'часы/день',
                source: 'ВОЗ, 2019',
                comment: 'Ограничение времени использования экранов'
            },

            mentalHealth: {
                stress: {
                    optimal: 3,
                    acceptable: 5,
                    high: 7,
                    critical: 9
                },
                satisfaction: {
                    optimal: 8,
                    good: 6,
                    low: 4
                },
                unit: 'баллы (1-10)',
                source: 'ВОЗ, 2021',
                comment: 'Субъективная оценка психологического благополучия'
            }
        };

        // Национальные стандарты (пример для РФ)
        this.nationalNorms = {
            russia: {
                sleep: {
                    schoolStudents: { min: 8, max: 10 },
                    universityStudents: { min: 7, max: 9 },
                    workingAdults: { min: 7, max: 8 }
                },
                physicalActivity: {
                    minimumSteps: 7000,
                    recommendedSteps: 10000
                },
                source: 'Минздрав РФ, 2022'
            }
        };

        // Научно обоснованные рекомендации
        this.scientificRecommendations = {
            sleepQuality: {
                poor: [1, 4],
                average: [5, 6],
                good: [7, 8],
                excellent: [9, 10]
            },

            workLifeBalance: {
                workHours: { optimal: 8, max: 10 },
                leisureTime: { optimal: 4, min: 2 },
                socialInteraction: { optimal: 2, min: 1 }
            },

            environmentalFactors: {
                airQuality: {
                    good: [8, 10],
                    moderate: [5, 7],
                    poor: [1, 4]
                },
                noiseLevel: {
                    quiet: [1, 3],
                    moderate: [4, 6],
                    loud: [7, 10]
                }
            }
        };
    }

    // Получение норм для конкретного параметра
    getNorm(parameter, age = '18-25', country = 'who') {
        const norms = country === 'who' ? this.whoNorms : this.nationalNorms[country];

        switch (parameter) {
            case 'sleep':
                return norms.sleep.ageGroups[age] || norms.sleep.ageGroups['18-25'];

            case 'steps':
                return norms.physicalActivity.steps;

            case 'nutrition':
                return norms.nutrition.fruitsVegetables;

            case 'screenTime':
                return age < 18 ? norms.screenTime.children[age] : norms.screenTime.adults;

            case 'stress':
                return norms.mentalHealth.stress;

            case 'satisfaction':
                return norms.mentalHealth.satisfaction;

            default:
                return this.getScientificNorm(parameter);
        }
    }

    // Получение научно обоснованных норм
    getScientificNorm(parameter) {
        return this.scientificRecommendations[parameter] || null;
    }

    // Проверка соответствия норме
    checkCompliance(value, parameter, age = '18-25') {
        const norm = this.getNorm(parameter, age);
        if (!norm) return { compliant: null, deviation: 0 };

        if (parameter === 'sleep') {
            if (value >= norm.min && value <= norm.max) {
                const deviation = Math.abs(value - norm.optimal) / norm.optimal * 100;
                return {
                    compliant: true,
                    level: value === norm.optimal ? 'оптимально' : 'допустимо',
                    deviation: deviation.toFixed(1),
                    recommendation: deviation > 10 ? 'Приблизить к оптимальному значению' : 'Поддерживать текущий уровень'
                };
            } else {
                return {
                    compliant: false,
                    level: value < norm.min ? 'недостаточно' : 'избыточно',
                    deviation: value < norm.min
                        ? ((norm.min - value) / norm.min * 100).toFixed(1)
                        : ((value - norm.max) / norm.max * 100).toFixed(1),
                    recommendation: value < norm.min
                        ? `Увеличить до ${norm.min} часов`
                        : `Уменьшить до ${norm.max} часов`
                };
            }
        }

        if (parameter === 'steps') {
            if (value >= norm.recommended) {
                return {
                    compliant: true,
                    level: 'отлично',
                    deviation: 0,
                    recommendation: 'Продолжайте в том же духе!'
                };
            } else if (value >= norm.minimum) {
                return {
                    compliant: true,
                    level: 'удовлетворительно',
                    deviation: ((norm.recommended - value) / norm.recommended * 100).toFixed(1),
                    recommendation: `Стремиться к ${norm.recommended} шагам`
                };
            } else {
                return {
                    compliant: false,
                    level: 'недостаточно',
                    deviation: ((norm.minimum - value) / norm.minimum * 100).toFixed(1),
                    recommendation: `Увеличить активность до ${norm.minimum} шагов`
                };
            }
        }

        if (parameter === 'stress') {
            if (value <= norm.optimal) {
                return {
                    compliant: true,
                    level: 'оптимально',
                    deviation: 0,
                    recommendation: 'Отличный уровень стрессоустойчивости'
                };
            } else if (value <= norm.acceptable) {
                return {
                    compliant: true,
                    level: 'допустимо',
                    deviation: ((value - norm.optimal) / norm.optimal * 100).toFixed(1),
                    recommendation: 'Рекомендуются методы релаксации'
                };
            } else {
                return {
                    compliant: false,
                    level: value <= norm.high ? 'повышенный' : 'критический',
                    deviation: ((value - norm.acceptable) / norm.acceptable * 100).toFixed(1),
                    recommendation: 'Необходима консультация специалиста'
                };
            }
        }

        // Для других параметров
        return {
            compliant: null,
            deviation: 0,
            recommendation: 'Нет данных для сравнения'
        };
    }

    // Расчет индекса соответствия нормам
    calculateNormComplianceIndex(measurements, age = '18-25') {
        const parameters = ['sleep', 'steps', 'stress', 'satisfaction'];
        let totalScore = 0;
        let validParameters = 0;

        const latestMeasurement = measurements[measurements.length - 1];
        if (!latestMeasurement) return { index: 0, details: [] };

        const details = [];

        parameters.forEach(param => {
            const value = latestMeasurement[param];
            if (value !== undefined) {
                const compliance = this.checkCompliance(value, param, age);

                let score = 0;
                if (compliance.compliant === true) {
                    score = compliance.level === 'отлично' || compliance.level === 'оптимально' ? 100 :
                        compliance.level === 'удовлетворительно' || compliance.level === 'допустимо' ? 75 : 50;
                } else if (compliance.compliant === false) {
                    score = 25;
                }

                totalScore += score;
                validParameters++;

                details.push({
                    parameter: param,
                    value: value,
                    norm: this.getNorm(param, age),
                    compliance: compliance,
                    score: score
                });
            }
        });

        const index = validParameters > 0 ? totalScore / validParameters : 0;

        return {
            index: Math.round(index),
            details: details,
            interpretation: this.interpretComplianceIndex(index)
        };
    }

    interpretComplianceIndex(index) {
        if (index >= 90) return 'Отличное соответствие нормам';
        if (index >= 75) return 'Хорошее соответствие нормам';
        if (index >= 60) return 'Удовлетворительное соответствие нормам';
        if (index >= 40) return 'Неудовлетворительное соответствие нормам';
        return 'Критическое несоответствие нормам';
    }

    // Генерация рекомендаций на основе норм
    generateNormBasedRecommendations(measurements, age = '18-25') {
        const recommendations = [];
        const latest = measurements[measurements.length - 1];

        if (!latest) return recommendations;

        // Проверка сна
        const sleepCompliance = this.checkCompliance(latest.sleep, 'sleep', age);
        if (!sleepCompliance.compliant || sleepCompliance.level !== 'оптимально') {
            recommendations.push(sleepCompliance.recommendation);
        }

        // Проверка физической активности
        if (latest.steps !== undefined) {
            const stepsCompliance = this.checkCompliance(latest.steps, 'steps', age);
            if (!stepsCompliance.compliant || stepsCompliance.level !== 'отлично') {
                recommendations.push(stepsCompliance.recommendation);
            }
        }

        // Проверка стресса
        const stressCompliance = this.checkCompliance(latest.stress, 'stress', age);
        if (stressCompliance.compliant === false) {
            recommendations.push(stressCompliance.recommendation);
        }

        // Проверка удовлетворенности
        if (latest.satisfaction !== undefined && latest.satisfaction < 7) {
            recommendations.push('Уделить внимание повышению удовлетворенности жизнью');
        }

        // Общие рекомендации
        if (recommendations.length === 0) {
            recommendations.push('Ваши показатели соответствуют нормам ВОЗ. Продолжайте поддерживать здоровый образ жизни!');
        }

        return recommendations;
    }

    // Создание отчета о соответствии нормам
    createNormComplianceReport(measurements, age = '18-25', country = 'who') {
        const report = {
            date: new Date().toLocaleDateString(),
            ageGroup: age,
            normsSource: country === 'who' ? 'Всемирная организация здравоохранения (ВОЗ)' :
                `Национальные нормы (${country.toUpperCase()})`,
            complianceIndex: this.calculateNormComplianceIndex(measurements, age),
            parameterAnalysis: [],
            recommendations: this.generateNormBasedRecommendations(measurements, age),
            summary: ''
        };

        // Анализ по параметрам
        const latest = measurements[measurements.length - 1];
        if (latest) {
            Object.keys(latest).forEach(param => {
                if (typeof latest[param] === 'number') {
                    const compliance = this.checkCompliance(latest[param], param, age);
                    if (compliance.compliant !== null) {
                        report.parameterAnalysis.push({
                            parameter: param,
                            value: latest[param],
                            unit: this.getParameterUnit(param),
                            compliance: compliance,
                            norm: this.getNorm(param, age, country)
                        });
                    }
                }
            });
        }

        // Сводка
        const index = report.complianceIndex.index;
        report.summary = `Общий индекс соответствия нормам: ${index}/100. ${report.complianceIndex.interpretation}.`;

        return report;
    }

    getParameterUnit(parameter) {
        const units = {
            sleep: 'часы',
            sleepQuality: 'баллы (1-10)',
            steps: 'шаги',
            stress: 'баллы (1-10)',
            satisfaction: 'баллы (1-10)',
            screenTime: 'часы',
            socialActivity: 'часы'
        };

        return units[parameter] || 'единицы';
    }

    // Получение нормативных диапазонов для графиков
    getNormRanges(parameter, age = '18-25') {
        const norm = this.getNorm(parameter, age);

        switch (parameter) {
            case 'sleep':
                return {
                    optimal: [norm.optimal - 0.5, norm.optimal + 0.5],
                    acceptable: [norm.min, norm.max],
                    unit: 'часы'
                };

            case 'steps':
                return {
                    optimal: [norm.recommended, norm.optimal || norm.recommended * 1.2],
                    acceptable: [norm.minimum, norm.recommended],
                    unit: 'шаги'
                };

            case 'stress':
                return {
                    optimal: [1, norm.optimal],
                    acceptable: [norm.optimal + 0.1, norm.acceptable],
                    high: [norm.acceptable + 0.1, norm.high],
                    critical: [norm.high + 0.1, 10],
                    unit: 'баллы'
                };

            default:
                return {
                    optimal: [7, 10],
                    acceptable: [5, 7],
                    low: [1, 5],
                    unit: 'баллы'
                };
        }
    }
}

// Экспорт класса
window.QualityOfLifeNorms = QualityOfLifeNorms;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function () {
    const norms = new QualityOfLifeNorms();
    window.qualityOfLifeNorms = norms;

    // Обновление сравнения с нормами
    updateNormComparison();
});

function updateNormComparison() {
    const measurements = JSON.parse(localStorage.getItem('lifeMeasurements') || '[]');
    if (measurements.length === 0) return;

    const norms = new QualityOfLifeNorms();
    const latest = measurements[measurements.length - 1];

    const tableBody = document.getElementById('whoComparison');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const parameters = [
        { key: 'sleep', label: 'Сон', format: v => `${v} ч` },
        { key: 'steps', label: 'Шаги', format: v => v?.toLocaleString() + ' шагов' },
        { key: 'stress', label: 'Стресс', format: v => `${v} баллов` },
        { key: 'satisfaction', label: 'Удовлетворенность', format: v => `${v} баллов` }
    ];

    parameters.forEach(param => {
        const value = latest[param.key];
        if (value === undefined) return;

        const compliance = norms.checkCompliance(value, param.key);
        const norm = norms.getNorm(param.key);

        let normText = '';
        let deviation = '';
        let percent = '';

        if (param.key === 'sleep' && norm.ageGroups) {
            const sleepNorm = norm.ageGroups['18-25'];
            normText = `${sleepNorm.min}-${sleepNorm.max} ч`;
            deviation = compliance.deviation + '%';
            percent = ((value / sleepNorm.optimal) * 100).toFixed(0) + '%';
        } else if (param.key === 'steps') {
            normText = `≥${norm.minimum}`;
            deviation = compliance.deviation + '%';
            percent = ((value / norm.recommended) * 100).toFixed(0) + '%';
        } else {
            normText = 'См. шкалу';
            deviation = compliance.deviation;
            percent = (value / 10 * 100).toFixed(0) + '%';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${param.label}</td>
            <td>${param.format(value)}</td>
            <td>${normText}</td>
            <td>${deviation}</td>
            <td>${percent}</td>
        `;

        if (!compliance.compliant) {
            row.style.backgroundColor = '#fff5f5';
        } else if (compliance.level === 'отлично' || compliance.level === 'оптимально') {
            row.style.backgroundColor = '#f0fff4';
        }

        tableBody.appendChild(row);
    });
}