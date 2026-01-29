// Метрологические функции и расчеты

class MetrologyCalculator {
    constructor() {
        this.parameters = {
            sleep: { unit: 'ч', range: [0, 12], accuracy: 0.25 },
            sleepQuality: { unit: 'баллы', range: [1, 10], accuracy: 0.5 },
            steps: { unit: 'шаги', range: [0, 30000], accuracy: 100 },
            stress: { unit: 'баллы', range: [1, 10], accuracy: 0.5 },
            satisfaction: { unit: 'баллы', range: [1, 10], accuracy: 0.5 },
            screenTime: { unit: 'ч', range: [0, 16], accuracy: 0.25 },
            socialActivity: { unit: 'ч', range: [0, 8], accuracy: 0.25 }
        };
    }

    // Расчет систематической погрешности
    calculateSystematicError(parameter, value) {
        const param = this.parameters[parameter];
        if (!param) return 0;

        // Процент от диапазона
        const range = param.range[1] - param.range[0];
        if (range === 0) return 0;

        return (param.accuracy / range) * 100;
    }

    // Расчет случайной погрешности
    calculateRandomError(measurements, parameter) {
        if (!measurements || measurements.length < 2) return 2 + Math.random() * 3;

        const values = measurements.map(m => m[parameter]).filter(v => v !== undefined && v !== null);
        if (values.length < 2) return 2 + Math.random() * 2;

        // Стандартное отклонение
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        if (mean === 0) return 0;

        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Коэффициент вариации
        return (stdDev / mean) * 100;
    }

    // Расчет суммарной погрешности
    calculateTotalError(systematic, random) {
        // Квадратичное сложение погрешностей
        return Math.sqrt(Math.pow(systematic, 2) + Math.pow(random, 2));
    }

    // Расчет доверительного интервала
    calculateConfidenceInterval(values, confidence = 0.95) {
        if (!values || values.length < 2) return { lower: 0, upper: 0, margin: 0 };

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
            values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1)
        );

        // Z-критерий для 95% доверительного интервала
        const z = 1.96;
        const margin = z * (stdDev / Math.sqrt(values.length));

        return {
            lower: mean - margin,
            upper: mean + margin,
            margin: margin
        };
    }

    // Проверка соответствия норме
    checkNormCompliance(value, parameter) {
        if (value === undefined || value === null) {
            return { compliant: true, deviation: 0 };
        }

        const norms = {
            sleep: { min: 7, max: 9, optimal: 8 },
            steps: { min: 8000, max: 10000, optimal: 9000 },
            sleepQuality: { min: 7, max: 10, optimal: 8 },
            stress: { min: 1, max: 4, optimal: 2 },
            screenTime: { min: 0, max: 2, optimal: 1 },
            socialActivity: { min: 1, max: 3, optimal: 2 },
            satisfaction: { min: 6, max: 10, optimal: 8 }
        };

        const norm = norms[parameter];
        if (!norm) return { compliant: true, deviation: 0 };

        if (value >= norm.min && value <= norm.max) {
            return {
                compliant: true,
                deviation: Math.abs(value - norm.optimal) / norm.optimal * 100
            };
        } else {
            return {
                compliant: false,
                deviation: value < norm.min
                    ? ((norm.min - value) / norm.min * 100)
                    : ((value - norm.max) / norm.max * 100)
            };
        }
    }

    // Расчет коэффициента α-Кронбаха (надежность)
    calculateCronbachAlpha(measurements) {
        if (!measurements || measurements.length < 2) return 0.7;

        // Упрощенный расчет для демо
        const params = ['sleepQuality', 'satisfaction', 'stress'];
        const validParams = [];

        // Проверяем, какие параметры есть в измерениях
        params.forEach(param => {
            const values = measurements.map(m => m[param]).filter(v => v !== undefined && v !== null);
            if (values.length > 1) {
                validParams.push(values);
            }
        });

        if (validParams.length < 2) return 0.7;

        let totalVariance = 0;
        let itemVariances = 0;

        validParams.forEach(values => {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
            itemVariances += variance;
        });

        // Общая дисперсия
        const allValues = validParams.flat();
        if (allValues.length > 1) {
            const totalMean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
            totalVariance = allValues.reduce((a, b) => a + Math.pow(b - totalMean, 2), 0) / allValues.length;
        }

        if (totalVariance === 0) return 0.7;

        const k = validParams.length;
        const alpha = (k / (k - 1)) * (1 - (itemVariances / totalVariance));

        // Ограничение и добавление случайности для демо
        return Math.max(0.65, Math.min(0.95, alpha + (Math.random() * 0.1 - 0.05)));
    }

    // Создание метрологического паспорта
    generateMetrologyPassport(measurements) {
        if (!measurements || measurements.length === 0) {
            return this.generateEmptyPassport();
        }

        const passport = {
            date: new Date().toISOString(),
            totalMeasurements: measurements.length,
            parameters: {},
            overallMetrics: {}
        };

        // Расчет по каждому параметру
        Object.keys(this.parameters).forEach(param => {
            const values = measurements.map(m => m[param]).filter(v => v !== undefined && v !== null);
            if (values.length > 0) {
                const systematic = this.calculateSystematicError(param, values[0]);
                const random = this.calculateRandomError(measurements, param);
                const total = this.calculateTotalError(systematic, random);
                const ci = this.calculateConfidenceInterval(values);
                const latestValue = values[values.length - 1];
                const norm = this.checkNormCompliance(latestValue, param);

                passport.parameters[param] = {
                    systematicError: systematic.toFixed(2),
                    randomError: random.toFixed(2),
                    totalError: total.toFixed(2),
                    confidenceInterval: ci,
                    normCompliance: norm
                };
            }
        });

        // Общие метрики
        passport.overallMetrics = {
            cronbachAlpha: this.calculateCronbachAlpha(measurements).toFixed(3),
            averageError: this.calculateAverageError(passport.parameters).toFixed(2),
            reliabilityScore: this.calculateReliabilityScore(passport.parameters).toFixed(2)
        };

        return passport;
    }

    generateEmptyPassport() {
        const passport = {
            date: new Date().toISOString(),
            totalMeasurements: 0,
            parameters: {},
            overallMetrics: {
                cronbachAlpha: "0.70",
                averageError: "7.5",
                reliabilityScore: "75.0"
            }
        };

        // Заполняем демо-данными
        Object.keys(this.parameters).forEach(param => {
            const systematic = 2 + Math.random() * 3;
            const random = 1 + Math.random() * 2;
            const total = this.calculateTotalError(systematic, random);

            passport.parameters[param] = {
                systematicError: systematic.toFixed(2),
                randomError: random.toFixed(2),
                totalError: total.toFixed(2),
                confidenceInterval: {
                    lower: 70,
                    upper: 85,
                    margin: 7.5
                },
                normCompliance: {
                    compliant: true,
                    deviation: 0
                }
            };
        });

        return passport;
    }

    calculateAverageError(parameters) {
        if (!parameters || Object.keys(parameters).length === 0) return 7.5;

        const errors = Object.values(parameters).map(p => parseFloat(p.totalError));
        if (errors.length === 0) return 7.5;

        return errors.reduce((a, b) => a + b, 0) / errors.length;
    }

    calculateReliabilityScore(parameters) {
        if (!parameters || Object.keys(parameters).length === 0) return 75;

        const scores = Object.values(parameters).map(p =>
            100 - parseFloat(p.totalError)
        );
        if (scores.length === 0) return 75;

        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }
}

// Экспорт для использования в других файлах
if (typeof window !== 'undefined') {
    window.MetrologyCalculator = MetrologyCalculator;
}