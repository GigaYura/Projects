// Статистические расчеты для исследования

class StatisticsAnalyzer {
    constructor() {
        this.methods = {
            descriptive: ['mean', 'median', 'mode', 'stdDev', 'variance', 'range', 'iqr'],
            correlation: ['pearson', 'spearman', 'kendall'],
            regression: ['linear', 'polynomial', 'exponential'],
            timeSeries: ['movingAverage', 'trendAnalysis', 'seasonalDecomposition']
        };
    }

    // Основные статистические функции
    mean(values) {
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    median(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    mode(values) {
        const frequency = {};
        values.forEach(v => {
            frequency[v] = (frequency[v] || 0) + 1;
        });

        let maxFreq = 0;
        let modes = [];

        for (const [value, freq] of Object.entries(frequency)) {
            if (freq > maxFreq) {
                maxFreq = freq;
                modes = [parseFloat(value)];
            } else if (freq === maxFreq) {
                modes.push(parseFloat(value));
            }
        }

        return modes.length === 1 ? modes[0] : modes;
    }

    standardDeviation(values) {
        const avg = this.mean(values);
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }

    variance(values) {
        const avg = this.mean(values);
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        return this.mean(squareDiffs);
    }

    coefficientOfVariation(values) {
        return (this.standardDeviation(values) / this.mean(values)) * 100;
    }

    // Корреляционный анализ
    pearsonCorrelation(x, y) {
        if (x.length !== y.length) return null;

        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt(
            (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
        );

        return denominator !== 0 ? numerator / denominator : 0;
    }

    spearmanCorrelation(x, y) {
        if (x.length !== y.length) return null;

        // Ранжирование
        const rank = arr => {
            const sorted = [...arr].sort((a, b) => a - b);
            return arr.map(v => sorted.indexOf(v) + 1);
        };

        const rankX = rank(x);
        const rankY = rank(y);

        // Расчет разностей рангов
        const d = rankX.map((rx, i) => rx - rankY[i]);
        const d2 = d.map(v => v * v);
        const sumD2 = d2.reduce((a, b) => a + b, 0);
        const n = x.length;

        return 1 - (6 * sumD2) / (n * (n * n - 1));
    }

    // Регрессионный анализ
    linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    }

    // Анализ временных рядов
    movingAverage(values, window = 3) {
        const result = [];
        for (let i = 0; i < values.length; i++) {
            const start = Math.max(0, i - Math.floor(window / 2));
            const end = Math.min(values.length, i + Math.ceil(window / 2));
            const windowValues = values.slice(start, end);
            result.push(this.mean(windowValues));
        }
        return result;
    }

    trendAnalysis(values) {
        const x = Array.from({ length: values.length }, (_, i) => i);
        const regression = this.linearRegression(x, values);

        return {
            slope: regression.slope,
            trend: regression.slope > 0 ? 'возрастающий' :
                regression.slope < 0 ? 'убывающий' : 'стабильный',
            strength: Math.abs(regression.slope) / this.standardDeviation(values)
        };
    }

    // Анализ распределения
    distributionAnalysis(values) {
        const analysis = {
            mean: this.mean(values),
            median: this.median(values),
            mode: this.mode(values),
            stdDev: this.standardDeviation(values),
            variance: this.variance(values),
            cv: this.coefficientOfVariation(values),
            range: Math.max(...values) - Math.min(...values),
            quartiles: this.calculateQuartiles(values),
            skewness: this.calculateSkewness(values),
            kurtosis: this.calculateKurtosis(values)
        };

        return analysis;
    }

    calculateQuartiles(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const q1 = this.median(sorted.slice(0, Math.floor(sorted.length / 2)));
        const q2 = this.median(sorted);
        const q3 = this.median(sorted.slice(Math.ceil(sorted.length / 2)));

        return { q1, q2, q3, iqr: q3 - q1 };
    }

    calculateSkewness(values) {
        const mean = this.mean(values);
        const stdDev = this.standardDeviation(values);
        const n = values.length;

        const cubedDeviations = values.map(v => Math.pow((v - mean) / stdDev, 3));
        return n * cubedDeviations.reduce((a, b) => a + b, 0) / ((n - 1) * (n - 2));
    }

    calculateKurtosis(values) {
        const mean = this.mean(values);
        const stdDev = this.standardDeviation(values);
        const n = values.length;

        const fourthDeviations = values.map(v => Math.pow((v - mean) / stdDev, 4));
        return (n * (n + 1) * fourthDeviations.reduce((a, b) => a + b, 0)) /
            ((n - 1) * (n - 2) * (n - 3)) -
            (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    }

    // Генерация статистического отчета
    generateStatisticalReport(measurements) {
        const report = {
            timestamp: new Date().toISOString(),
            sampleSize: measurements.length,
            parameters: {},
            correlations: {},
            trends: {},
            overallStats: {}
        };

        // Сбор данных по параметрам
        const paramData = {};
        Object.keys(measurements[0] || {}).forEach(param => {
            if (typeof measurements[0][param] === 'number') {
                const values = measurements.map(m => m[param]);
                paramData[param] = values;
                report.parameters[param] = this.distributionAnalysis(values);
            }
        });

        // Корреляционный анализ
        const params = Object.keys(paramData);
        for (let i = 0; i < params.length; i++) {
            for (let j = i + 1; j < params.length; j++) {
                const param1 = params[i];
                const param2 = params[j];
                const correlation = this.pearsonCorrelation(
                    paramData[param1],
                    paramData[param2]
                );

                if (!isNaN(correlation)) {
                    report.correlations[`${param1}_${param2}`] = {
                        pearson: correlation,
                        strength: Math.abs(correlation) >= 0.7 ? 'сильная' :
                            Math.abs(correlation) >= 0.3 ? 'средняя' : 'слабая',
                        direction: correlation > 0 ? 'прямая' : 'обратная'
                    };
                }
            }
        }

        // Анализ трендов
        params.forEach(param => {
            const values = paramData[param];
            if (values.length > 5) {
                report.trends[param] = this.trendAnalysis(values);
            }
        });

        // Общая статистика
        const allValues = Object.values(paramData).flat();
        report.overallStats = {
            totalMeasurements: allValues.length,
            averageValue: this.mean(allValues),
            dataQuality: this.calculateDataQuality(measurements),
            completeness: this.calculateCompleteness(measurements)
        };

        return report;
    }

    calculateDataQuality(measurements) {
        // Оценка качества данных
        let qualityScore = 0;
        const totalParams = Object.keys(measurements[0] || {}).length;

        measurements.forEach(measurement => {
            const validParams = Object.values(measurement).filter(v =>
                v !== null && v !== undefined && v !== ''
            ).length;
            qualityScore += validParams / totalParams;
        });

        return (qualityScore / measurements.length) * 100;
    }

    calculateCompleteness(measurements) {
        if (measurements.length === 0) return 0;

        const expectedDays = Math.floor(
            (new Date() - new Date(measurements[0].date)) / (1000 * 60 * 60 * 24)
        ) + 1;

        return (measurements.length / expectedDays) * 100;
    }
}

// Экспорт класса
window.StatisticsAnalyzer = StatisticsAnalyzer;