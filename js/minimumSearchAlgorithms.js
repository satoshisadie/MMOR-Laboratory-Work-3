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

        while (fStart >= fEnd) {
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
    calculateXmin: function (xs, f) {
        xs.fx0 = xs.fx0 || f(xs.x0);
        xs.fx1 = xs.fx1 || f(xs.x1);
        xs.fx2 = xs.fx2 || f(xs.x2);

        return xs.x1 + 1 / 2 * (Math.pow(xs.x2 - xs.x1, 2) * (xs.fx0 - xs.fx1) -
                                Math.pow(xs.x1 - xs.x0, 2) * (xs.fx2 - xs.fx1)) /
                               ((xs.x2 - xs.x1) * (xs.fx0 - xs.fx1) +
                                (xs.x1 - xs.x0) * (xs.fx2 - xs.fx1));
    },
    reorderForBestTriple: function(xs) {
        if (xs.fx1 > xs.fx2 ||
            xs.fx1 == xs.fx2 && xs.x2 - xs.x0 > xs.x3 - xs.x1)
        {
            xs.x0 = xs.x1;
            xs.fx0 = xs.fx1;
            xs.x1 = xs.x2;
            xs.fx1 = xs.fx2;
            xs.x2 = xs.x3;
            xs.fx2 = xs.fx3;
        }
    },
    assignX3: function(xs, xMin, fxMin) {
        if (xMin > xs.x1) {
            xs.x3 = xs.x2;
            xs.fx3 = xs.fx2;
            xs.x2 = xMin;
            xs.fx2 = fxMin;
        } else {
            xs.x3 = xs.x2;
            xs.fx3 = xs.fx2;
            xs.x2 = xs.x1;
            xs.fx2 = xs.fx1;
            xs.x1 = xMin;
            xs.fx1 = fxMin;
        }
    },
    search : function (epsilon, intervalStart, intervalEnd, f) {
        var result = {
            iterationsCount: 0,
            functionCalculationsCount: 3
        };

        var xs = {
            x0: intervalStart,
            x1: minimumIntervalSearch.searchInterval(intervalStart, f, 0.01).start,
            x2: intervalEnd
        };

        do {
            var xMin = this.calculateXmin(xs, f);

            result.x = xMin;
            result.fx = f(xMin);
            result.iterationsCount++;
            result.functionCalculationsCount++;

            this.assignX3(xs, result.x, result.fx);
            this.reorderForBestTriple(xs);
        } while (Math.abs(result.x - xs.x1) > epsilon);

        return result;
    }
};

//var interval = minimumIntervalSearch.searchInterval(3, f, 0.01);
//alert(interval.start + '   ' + interval.end);

//var dichotomyResult = dichotomy.search(1e-4, 1e-4 / 2, 2, 7, f);
//alert(dichotomyResult.x + '   ' + dichotomyResult.iterationsCount);

//var goldenSectionResult = goldenSection.search(1e-8, 2, 7, f);
//alert(goldenSectionResult.x + '   ' + goldenSectionResult.iterationsCount);

//var fibonacciResult = fibonacci.search(1e-8, 2, 7, f);
//alert(fibonacciResult.x + '   ' + fibonacciResult.functionCalculationsCount);
//
var quadraticInterpolationResult = quadraticInterpolation.search(1e-4, 2, 7, f);
alert(quadraticInterpolationResult.x + '   ' + quadraticInterpolationResult.functionCalculationsCount);