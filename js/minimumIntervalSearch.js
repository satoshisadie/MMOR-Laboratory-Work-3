function f(x) {
    return Math.log(x) / Math.log(10) + Math.sin(x);
}

var minimumIntervalSearch = {
    searchInterval: function (x0, f, step) {
        var xRight = this.checkDirection(x0, f, step);
        var xLeft = this.checkDirection(x0, f, -step);

        while(!xRight && !xLeft) {
            step /= 2;

            xRight = this.checkDirection(x0, f, step);
            xLeft = this.checkDirection(x0, f, -step);
        }

        return this.moveToMinimum(xRight ? xRight : xLeft, f, xRight ? step : -step);
    },

    checkDirection: function (x0, f, step) {
        var x = x0 + step;
        return f(x) <= f(x0) ? x : null;
    },

    moveToMinimum: function (intervalStart, f, step) {
        var intervalEnd = intervalStart + step;

        var fStart = f(intervalStart);
        var fEnd = f(intervalEnd);

        while (fEnd <= fStart) {
            intervalStart = intervalEnd;
            intervalEnd = intervalStart + step;

            fStart = f(intervalStart);
            fEnd = f(intervalEnd);
        }

        return {
            start: Math.min(intervalStart, intervalEnd),
            end: Math.max(intervalStart, intervalEnd)
        };
    }
};

var dichotomy = {
    search: function (epsilon, delta, intervalStart, intervalEnd, f) {
        var result = {
            iterationsCount: 0
        };

        do {
            var x1 = (intervalStart + intervalEnd - delta) / 2;
            var x2 = (intervalStart + intervalEnd + delta) / 2;

            var fx1 = f(x1);
            var fx2 = f(x2);

            intervalStart = fx1 <= fx2 ? intervalStart : x1;
            intervalEnd = fx1 <= fx2 ? x2 : intervalEnd;

            result.x = fx1 <= fx2 ? intervalStart : intervalEnd;
            result.iterationsCount++;
        } while (intervalEnd - intervalStart > epsilon);

        result.functionCalculationsCount = 2 * result.iterationsCount;
        return result;
    }
};

var goldenSection = {
    search: function (epsilon, intervalStart, intervalEnd, f) {
        var result = {
            iterationsCount: 0,
            functionCalculationsCount: 2
        };

        var u = intervalStart + (3 - Math.sqrt(5)) / 2 * (intervalEnd - intervalStart);
        var v = intervalStart + intervalEnd - u;
        var fu = f(u);
        var fv = f(v);

        do {
            if (fu <= fv) {
                result.x = u;
                result.fx = fu;

                intervalEnd = v;
                v = u;
                fv = fu;
                u = intervalStart + intervalEnd - v;
                fu = f(u);
            } else {
                result.x = v;
                result.fx = fv;

                intervalStart = u;
                u = v;
                fu = fv;
                v = intervalStart + intervalEnd - u;
                fv = f(v);
            }

            result.iterationsCount++;
            result.functionCalculationsCount++;
        } while (intervalEnd - intervalStart > epsilon);

        return result;
    }
};

var fibonacci = {
    getIterationsCount: function (epsilon, intervalStart, intervalEnd) {
        var n = 1;

        while ((intervalEnd - intervalStart) / this.getFibonacciNumber(n + 2) >= epsilon) {
            n++;
        }

        return n;
    },

    getFibonacciNumber: function (n) {
        if (n == 0 || n== 1) {
            return 1;
        } else {
            return this.getFibonacciNumber(n - 1) + this.getFibonacciNumber(n - 2);
        }
    },

    search : function (epsilon, intervalStart, intervalEnd, f) {
        var iterationsCount = this.getIterationsCount(epsilon, intervalStart, intervalEnd);

        var result = {
            functionCalculationsCount: 2 + iterationsCount,
            iterationsCount: iterationsCount
        };

        var nthNumber = this.getFibonacciNumber(iterationsCount);
        var nthPlusTwoNumber = this.getFibonacciNumber(iterationsCount + 2);

        var u = intervalStart + nthNumber / nthPlusTwoNumber * (intervalEnd - intervalStart);
        var v = intervalStart + intervalEnd - u;

        var fu = f(u);
        var fv = f(v);

        for (var i = 0; i < iterationsCount; i++) {
            if (fu <= fv) {
                result.x = u;
                result.fx = fu;

                intervalEnd = v;
                v = u;
                fv = fu;
                u = intervalStart + intervalEnd - v;
                fu = f(u);
            } else {
                result.x = v;
                result.fx = fv;

                intervalStart = u;
                u = v;
                fu = fv;
                v = intervalStart + intervalEnd - u;
                fv = f(v);
            }
        }

        return result;
    }
};

var quadraticInterpolation = {
    calculateXmin: function (x0, x1, x2, f) {
        var result = {
            fx0: f(x0),
            fx1: f(x1),
            fx2: f(x2)
        };

        result.x = x1 + 1 / 2 * (Math.pow(x2 - x1, 2) * (result.fx0 - result.fx1) -
                                 Math.pow(x1 - x0, 2) * (result.fx2 - result.fx1)) /
                                ((x2 - x1) * (result.fx0 - result.fx1) +
                                 (x1 - x0) * (result.fx2 - result.fx1));

        return result;
    },

    getTriple: function(x0, x1, x2, x3, fx0, fx1, fx2, fx3) {
        var result = {};

        if (fx1 < fx2) {
            result.x0 = x0;
            result.x1 = x1;
            result.x2 = x2;
        } else {
            result.x0 = x1;
            result.x1 = x2;
            result.x2 = x3;
        }

        return result;
    },

    search : function (epsilon, intervalStart, intervalEnd, f) {
        var result = {
            iterationsCount: 0,
            functionCalculationsCount: 0
        };

        var x0 = intervalStart;
        var x1 = minimumIntervalSearch.searchInterval(intervalStart, f, 0.01);
        var x2 = intervalEnd;
        var x3;

        var minCalculation = this.calculateXmin(x0, x1, x2, f);
        result.x = minCalculation.x;
        result.functionCalculationsCount += 3;

        while (Math.abs(result.x - x1) > epsilon) {
            if (result.x > x1) {
                x3 = x2;
                x2 = result.x;
            } else {
                x3 = x2;
                x2 = x1;
                x1 = result.x;
            }

            var triple = this.getTriple(x0, x1, x2, x3, minCalculation.fx0, minCalculation.fx1, minCalculation.fx2)
        }

        result.fx = f(result.x);
        return result;
    }
};

//var interval = minimumIntervalSearch.searchInterval(3, f, 0.01);
//alert(interval.start + '   ' + interval.end);

//var dichotomyResult = dichotomy.search(1e-4, 1e-4 / 2, 2, 7, f);
//alert(dichotomyResult.x + '   ' + dichotomyResult.iterationsCount);

//var goldenSectionResult = goldenSection.search(1e-4, 2, 7, f);
//alert(goldenSectionResult.x + '   ' + goldenSectionResult.iterationsCount);

var fibonacciResult = fibonacci.search(1e-8, 2, 7, f);
alert(fibonacciResult.x + '   ' + fibonacciResult.functionCalculationsCount);

//var quadraticInterpolationResult = quadraticInterpolation.search(1e-4, 2, 7, f);
//alert(quadraticInterpolationResult.x + '   ' + quadraticInterpolationResult.iterationsCount);