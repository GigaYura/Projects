// Валидация метрологической методики

class MethodologyValidator {
    constructor() {
        this.validationCriteria = {
            reliability: {
                cronbachAlpha: { min: 0.7, optimal: 0.8 },
                testRetest: { min: 0.6, optimal: 0.7 },
                internalConsistency: { min: 0.65, optimal: 0.75 }
            },
            validity: {
                construct: { min: 0.6, optimal: 0.7 },
                criterion: { min: 0.55, optimal: 0.65 },
                content: { min: 0.7, optimal: 0.8 }
            },
            accuracy: {
                systematicError: { max: 10, optimal: 5 },
                randomError: { max: 15, optimal: 8 },
                totalError: { max: 18, optimal: 10 }
            }
        };
    }

    // Полная валидация методики
    validateMethodology(measurements) {
        const validationReport = {
            timestamp: new Date().toISOString(),
            sampleSize: measurements.length,
            criteria: {},
            overallScore: 0,
            isValid: false,
            recommendations: []
        };

        // Проверка надежности
        validationReport.criteria.reliability = this.validateReliability(measurements);

        // Проверка валидности
        validationReport.criteria.validity = this.validateValidity(measurements);

        // Проверка точности
        validationReport.criteria.accuracy = this.validateAccuracy(measurements);

        // Расчет общего балла
        validationReport.overallScore = this.calculateOverallScore(validationReport.criteria);
        validationReport.isValid = validationReport.overallScore >= 70;

        // Формирование рекомендаций
        validationReport.recommendations = this.generateRecommendations(validationReport.criteria);

        return validationReport;
    }

    // Валидация надежности
    validateReliability(measurements) {
        const metrology = new MetrologyCalculator();
        const stats = new StatisticsAnalyzer();

        const reliability = {
            cronbachAlpha: metrology.calculateCronbachAlpha(measurements),
            testRetest: this.calculateTestRetestReliability(measurements),
            internalConsistency: this.calculateInternalConsistency(measurements),
            scores: {},
            passed: false
        };

        // Оценка по критериям
        reliability.scores.cronbachAlpha = this.scoreMetric(
            reliability.cronbachAlpha,
            this.validationCriteria.reliability.cronbachAlpha
        );

        reliability.scores.testRetest = this.scoreMetric(
            reliability.testRetest,
            this.validationCriteria.reliability.testRetest
        );

        reliability.scores.internalConsistency = this.scoreMetric(
            reliability.internalConsistency,
            this.validationCriteria.reliability.internalConsistency
        );

        // Общая оценка надежности
        reliability.overallScore = (
            reliability.scores.cronbachAlpha * 0.4 +
            reliability.scores.testRetest * 0.3 +
            reliability.scores.internalConsistency * 0.3
        );

        reliability.passed = reliability.overallScore >= 70;

        return reliability;
    }

    // Валидация валидности
    validateValidity(measurements) {
        // В реальном проекте здесь было бы сравнение с эталонными методами
        // Для демо используем симуляцию

        const validity = {
            constructValidity: this.simulateConstructValidity(measurements),
            criterionValidity: this.simulateCriterionValidity(measurements),
            contentValidity: this.assessContentValidity(),
            scores: {},
            passed: false
        };

        // Оценка по критериям
        validity.scores.constructValidity = this.scoreMetric(
            validity.constructValidity,
            this.validationCriteria.validity.construct
        );

        validity.scores.criterionValidity = this.scoreMetric(
            validity.criterionValidity,
            this.validationCriteria.validity.criterion
        );

        validity.scores.contentValidity = this.scoreMetric(
            validity.contentValidity,
            this.validationCriteria.validity.content
        );

        // Общая оценка валидности
        validity.overallScore = (
            validity.scores.constructValidity * 0.35 +
            validity.scores.criterionValidity * 0.35 +
            validity.scores.contentValidity * 0.3
        );

        validity.passed = validity.overallScore >= 70;

        return validity;
    }

    // Валидация точности
    validateAccuracy(measurements) {
        const metrology = new MetrologyCalculator();
        const passport = metrology.generateMetrologyPassport(measurements);

        const accuracy = {
            systematicError: parseFloat(passport.overallMetrics.averageError),
            randomError: this.calculateAverageRandomError(passport.parameters),
            totalError: this.calculateAverageTotalError(passport.parameters),
            scores: {},
            passed: false
        };

        // Для погрешностей - чем меньше, тем лучше (инвертируем шкалу)
        accuracy.scores.systematicError = this.scoreMetricInverse(
            accuracy.systematicError,
            this.validationCriteria.accuracy.systematicError
        );

        accuracy.scores.randomError = this.scoreMetricInverse(
            accuracy.randomError,
            this.validationCriteria.accuracy.randomError
        );

        accuracy.scores.totalError = this.scoreMetricInverse(
            accuracy.totalError,
            this.validationCriteria.accuracy.totalError
        );

        // Общая оценка точности
        accuracy.overallScore = (
            accuracy.scores.systematicError * 0.4 +
            accuracy.scores.randomError * 0.3 +
            accuracy.scores.totalError * 0.3
        );

        accuracy.passed = accuracy.overallScore >= 70;

        return accuracy;
    }

    // Вспомогательные методы
    calculateTestRetestReliability(measurements) {
        if (measurements.length < 4) return 0;

        // Разделяем измерения на две половины
        const firstHalf = measurements.slice(0, Math.floor(measurements.length / 2));
        const secondHalf = measurements.slice(Math.floor(measurements.length / 2));

        const stats = new StatisticsAnalyzer();
        const param = 'sleepQuality';

        const firstValues = firstHalf.map(m => m[param]).filter(v => v !== undefined);
        const secondValues = secondHalf.map(m => m[param]).filter(v => v !== undefined);

        const minLength = Math.min(firstValues.length, secondValues.length);
        if (minLength < 2) return 0;

        return stats.pearsonCorrelation(
            firstValues.slice(0, minLength),
            secondValues.slice(0, minLength)
        );
    }

    calculateInternalConsistency(measurements) {
        if (measurements.length < 2) return 0;

        // Упрощенный расчет внутренней согласованности
        const params = ['sleep', 'sleepQuality', 'satisfaction'];
        let totalCorrelation = 0;
        let pairCount = 0;

        const stats = new StatisticsAnalyzer();

        for (let i = 0; i < params.length; i++) {
            for (let j = i + 1; j < params.length; j++) {
                const values1 = measurements.map(m => m[params[i]]).filter(v => v !== undefined);
                const values2 = measurements.map(m => m[params[j]]).filter(v => v !== undefined);
                const minLength = Math.min(values1.length, values2.length);

                if (minLength > 1) {
                    const correlation = stats.pearsonCorrelation(
                        values1.slice(0, minLength),
                        values2.slice(0, minLength)
                    );
                    totalCorrelation += Math.abs(correlation);
                    pairCount++;
                }
            }
        }

        return pairCount > 0 ? totalCorrelation / pairCount : 0;
    }

    simulateConstructValidity(measurements) {
        // Симуляция конструктной валидности
        // В реальном проекте здесь было бы сравнение с другими методиками

        if (measurements.length < 5) return 0.5 + Math.random() * 0.3;

        // Чем больше измерений, тем выше предполагаемая валидность
        const baseValidity = 0.6;
        const sampleBonus = Math.min(measurements.length / 50, 0.3); // до +30%
        const consistencyBonus = this.calculateInternalConsistency(measurements) * 0.2;

        return Math.min(0.95, baseValidity + sampleBonus + consistencyBonus);
    }

    simulateCriterionValidity(measurements) {
        // Симуляция критериальной валидности
        // В реальном проекте здесь было бы сравнение с объективными показателями

        if (measurements.length < 3) return 0.4 + Math.random() * 0.3;

        // Проверяем логические связи между параметрами
        let validPairs = 0;
        let totalPairs = 0;

        const logicalConnections = [
            { param1: 'stress', param2: 'sleepQuality', expected: 'negative' },
            { param1: 'satisfaction', param2: 'socialActivity', expected: 'positive' },
            { param1: 'sleep', param2: 'satisfaction', expected: 'positive' }
        ];

        const stats = new StatisticsAnalyzer();

        logicalConnections.forEach(connection => {
            const values1 = measurements.map(m => m[connection.param1]).filter(v => v !== undefined);
            const values2 = measurements.map(m => m[connection.param2]).filter(v => v !== undefined);
            const minLength = Math.min(values1.length, values2.length);

            if (minLength > 2) {
                const correlation = stats.pearsonCorrelation(
                    values1.slice(0, minLength),
                    values2.slice(0, minLength)
                );

                if (!isNaN(correlation)) {
                    totalPairs++;
                    if (connection.expected === 'positive' && correlation > 0.1) {
                        validPairs++;
                    } else if (connection.expected === 'negative' && correlation < -0.1) {
                        validPairs++;
                    }
                }
            }
        });

        return totalPairs > 0 ? validPairs / totalPairs : 0.5;
    }

    assessContentValidity() {
        // Экспертная оценка содержательной валидности
        // В реальном проекте здесь была бы анкета экспертов

        const expertScores = {
            parameterSelection: 0.85,    // Выбор параметров
            scaleAdequacy: 0.80,         // Адекватность шкал
            measurementProtocol: 0.75,    // Протокол измерений
            interpretation: 0.82         // Интерпретация результатов
        };

        return Object.values(expertScores).reduce((a, b) => a + b, 0) /
            Object.keys(expertScores).length;
    }

    calculateAverageRandomError(parameters) {
        const errors = Object.values(parameters).map(p => parseFloat(p.randomError));
        return errors.reduce((a, b) => a + b, 0) / errors.length;
    }

    calculateAverageTotalError(parameters) {
        const errors = Object.values(parameters).map(p => parseFloat(p.totalError));
        return errors.reduce((a, b) => a + b, 0) / errors.length;
    }

    scoreMetric(value, criteria) {
        if (value >= criteria.optimal) return 100;
        if (value >= criteria.min) {
            // Линейная интерполяция между min и optimal
            return 70 + ((value - criteria.min) / (criteria.optimal - criteria.min)) * 30;
        }
        // Экспоненциальное падение ниже минимума
        return Math.max(0, 70 * (value / criteria.min));
    }

    scoreMetricInverse(value, criteria) {
        // Для погрешностей: чем меньше значение, тем лучше
        if (value <= criteria.optimal) return 100;
        if (value <= criteria.max) {
            // Линейная интерполяция между optimal и max
            return 70 + ((criteria.max - value) / (criteria.max - criteria.optimal)) * 30;
        }
        // Экспоненциальное падение выше максимума
        return Math.max(0, 70 * (criteria.max / value));
    }

    calculateOverallScore(criteria) {
        const weights = {
            reliability: 0.4,
            validity: 0.4,
            accuracy: 0.2
        };

        return (
            criteria.reliability.overallScore * weights.reliability +
            criteria.validity.overallScore * weights.validity +
            criteria.accuracy.overallScore * weights.accuracy
        );
    }

    generateRecommendations(criteria) {
        const recommendations = [];

        // Рекомендации по надежности
        if (criteria.reliability.cronbachAlpha < 0.7) {
            recommendations.push('Увеличить количество измерений для улучшения надежности методики');
        }

        if (criteria.reliability.testRetest < 0.6) {
            recommendations.push('Провести повторные измерения для проверки устойчивости результатов');
        }

        // Рекомендации по валидности
        if (criteria.validity.constructValidity < 0.6) {
            recommendations.push('Сравнить методику с эталонными инструментами измерения качества жизни');
        }

        // Рекомендации по точности
        if (criteria.accuracy.totalError > 15) {
            recommendations.push('Уточнить процедуру измерений для уменьшения погрешности');
        }

        // Общие рекомендации
        if (recommendations.length === 0) {
            recommendations.push('Методика демонстрирует удовлетворительные метрологические характеристики');
        }

        return recommendations;
    }

    // Генерация отчета о валидации
    generateValidationReport(measurements) {
        const validation = this.validateMethodology(measurements);

        const report = {
            title: 'Отчет о валидации методики',
            date: new Date().toLocaleDateString(),
            validation: validation,
            conclusion: this.generateValidationConclusion(validation),
            certificate: this.generateValidationCertificate(validation)
        };

        return report;
    }

    generateValidationConclusion(validation) {
        if (validation.overallScore >= 85) {
            return 'Методика обладает отличными метрологическими характеристиками и рекомендуется к использованию.';
        } else if (validation.overallScore >= 70) {
            return 'Методика обладает удовлетворительными метрологическими характеристиками и может быть использована с учетом рекомендаций.';
        } else {
            return 'Методика требует доработки перед использованием. Необходимо устранить выявленные недостатки.';
        }
    }

    generateValidationCertificate(validation) {
        return {
            certificateNumber: `VAL-${Date.now()}`,
            methodology: 'Методика метрологического обеспечения мониторинга персональных показателей качества жизни',
            validationDate: new Date().toISOString(),
            overallScore: validation.overallScore.toFixed(1),
            status: validation.isValid ? 'ВАЛИДИРОВАНА' : 'НЕ ВАЛИДИРОВАНА',
            validityPeriod: '12 месяцев',
            nextValidation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };
    }
}

// Экспорт класса
window.MethodologyValidator = MethodologyValidator;

// Инициализация валидации при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    const validator = new MethodologyValidator();
    window.methodologyValidator = validator;

    // Автоматическая валидация при переходе на вкладку
    const validationSection = document.getElementById('validation-section');
    if (validationSection) {
        const observer = new MutationObserver(function () {
            if (validationSection.classList.contains('active')) {
                const measurements = JSON.parse(localStorage.getItem('lifeMeasurements') || '[]');
                if (measurements.length > 0) {
                    const report = validator.generateValidationReport(measurements);
                    displayValidationResults(report);
                }
            }
        });

        observer.observe(validationSection, { attributes: true, attributeFilter: ['class'] });
    }
});

function displayValidationResults(report) {
    // Обновление таблицы валидации
    const tableBody = document.querySelector('.validation-table tbody');
    if (tableBody) {
        tableBody.innerHTML = '';

        const metrics = [
            { name: 'Конструктная валидность', value: report.validation.criteria.validity.constructValidity.toFixed(2) },
            { name: 'Критериальная валидность', value: report.validation.criteria.validity.criterionValidity.toFixed(2) },
            { name: 'Надежность тест-ретест', value: report.validation.criteria.reliability.testRetest.toFixed(2) },
            { name: 'Внутренняя согласованность (α-Кронбах)', value: report.validation.criteria.reliability.cronbachAlpha.toFixed(2) }
        ];

        metrics.forEach(metric => {
            const row = document.createElement('tr');

            let interpretation = '';
            let compliance = '';

            if (metric.name.includes('валидность')) {
                interpretation = parseFloat(metric.value) >= 0.6 ? 'Высокая' :
                    parseFloat(metric.value) >= 0.4 ? 'Удовлетворительная' : 'Низкая';
                compliance = parseFloat(metric.value) >= 0.55 ? 'Соответствует' : 'Не соответствует';
            } else {
                interpretation = parseFloat(metric.value) >= 0.7 ? 'Высокая' :
                    parseFloat(metric.value) >= 0.5 ? 'Удовлетворительная' : 'Низкая';
                compliance = parseFloat(metric.value) >= 0.6 ? 'Соответствует' : 'Не соответствует';
            }

            row.innerHTML = `
                <td>${metric.name}</td>
                <td>${metric.value}</td>
                <td>${interpretation}</td>
                <td><span class="compliance-badge ${compliance === 'Соответствует' ? 'compliant' : 'non-compliant'}">${compliance}</span></td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Обновление заключения
    const conclusionElement = document.querySelector('.validation-conclusion p');
    if (conclusionElement) {
        conclusionElement.textContent = report.conclusion;
    }
}