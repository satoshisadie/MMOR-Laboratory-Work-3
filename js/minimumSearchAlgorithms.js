var minimumIntervalSearch = {
    searchInterval: function (epsilon, x0, f, step) {
        var xRight = this.checkDirection(x0, f, step);
        var xLeft = this.checkDirection(x0, f, -step);

        while(!xRight && !xLeft && Math.abs(step) >= epsilon / 2) {
            step /= 2;

            xRight = this.checkDirection(x0, f, step);
            xLeft = this.checkDirection(x0, f, -step);
        }

        var result;
        if (Math.abs(step) >= epsilon / 2) {
            if (xRight)
                result = this.moveToMinimum(xRight, f, step);
            else {
                result = this.moveToMinimum(xLeft, f, -step);
            }
        } else {
            result = {
                x: x0,
                fx: f(x0)
            }
        }

        return result;
    },

    checkDirection: function (x0, f, step) {
        var x = x0 + step;

        var result = null;
        if (f(x) <= f(x0)) result = x;

        return result;
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

            if (fx1 <= fx2) {
                intervalEnd = x2;
                result.x = intervalStart;
            } else {
                intervalStart = x1;
                result.x = intervalEnd;
            }

            result.iterationsCount++;
        } while (intervalEnd - intervalStart > epsilon);

        result.functionCalculationsCount = 2 * result.iterationsCount;
        result.fx = f(result.x);
        return result;
    }
};

var goldenSection = {
    partition: function (intervalStart, intervalEnd, f) {
        var result = {};

        result.u = intervalStart + (3 - Math.sqrt(5)) / 2 * (intervalEnd - intervalStart);
        result.v = intervalStart + intervalEnd - result.u;
        result.fu = f(result.u);
        result.fv = f(result.v);

        return result;
    },

    search: function (epsilon, intervalStart, intervalEnd, f) {
        var result = {
            iterationsCount: 0,
            functionCalculationsCount: 2
        };

        var partition = this.partition(intervalStart, intervalEnd, f);

        do {
            if (partition.fu <= partition.fv) {
                result.x = partition.u;
                result.fx = partition.fu;

                intervalEnd = partition.v;
                partition.v = partition.u;
                partition.fv = partition.fu;
                partition.u = intervalStart + intervalEnd - partition.v;
                partition.fu = f(partition.u);
            } else {
                result.x = partition.v;
                result.fx = partition.fv;

                intervalStart = partition.u;
                partition.u = partition.v;
                partition.fu = partition.fv;
                partition.v = intervalStart + intervalEnd - partition.u;
                partition.fv = f(partition.v);
            }

            result.iterationsCount++;
            result.functionCalculationsCount++;

            if (partition.u >= partition.v) {
                partition = this.partition(intervalStart, intervalEnd, f);
            }
        } while (intervalEnd - intervalStart > epsilon);

        return result;
    }
};

var fibonacci = {
    partition: function (intervalStart, intervalEnd, f, n, k) {
        var nthNumber = this.getFibonacciNumber(n - k);
        var nthPlusTwoNumber = this.getFibonacciNumber(n - k + 2);

        var result = {};
        result.u = intervalStart + nthNumber / nthPlusTwoNumber * (intervalEnd - intervalStart);
        result.v = intervalStart + intervalEnd - result.u;
        result.fu = f(result.u);
        result.fv = f(result.v);

        return result;
    },

    getIterationsCount: function (epsilon, intervalStart, intervalEnd) {
        var n = 1;

        while ((intervalEnd - intervalStart) / this.getFibonacciNumber(n + 2) >= epsilon) {
            n++;
        }

        return n;
    },

    getFibonacciNumber: function (n) {
        var fibonacciNumbers = [1, 1];

        for (var i = 2; i <= n; i++) {
            fibonacciNumbers[i] = fibonacciNumbers[i - 1] + fibonacciNumbers[i - 2];
        }

        return fibonacciNumbers[n];
    },

    search : function (epsilon, intervalStart, intervalEnd, f) {
        var iterationsCount = this.getIterationsCount(epsilon, intervalStart, intervalEnd);

        var result = {
            functionCalculationsCount: 2 + iterationsCount,
            iterationsCount: iterationsCount
        };

        var partition = this.partition(intervalStart, intervalEnd, f, iterationsCount, 0);

        for (var i = 0; i < iterationsCount; i++) {
            if (partition.fu <= partition.fv) {
                result.x = partition.u;
                result.fx = partition.fu;

                intervalEnd = partition.v;
                partition.v = partition.u;
                partition.fv = partition.fu;
                partition.u = intervalStart + intervalEnd - partition.v;
                partition.fu = f(partition.u);
            } else {
                result.x = partition.v;
                result.fx = partition.fv;

                intervalStart = partition.u;
                partition.u = partition.v;
                partition.fu = partition.fv;
                partition.v = intervalStart + intervalEnd - partition.u;
                partition.fv = f(partition.v);
            }

            if (partition.u >= partition.v) {
                partition = this.partition(intervalStart, intervalEnd, f, iterationsCount, i);
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
            x1: minimumIntervalSearch.searchInterval(epsilon, intervalStart, f, 1e-3).start,
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

function f(x) {
    return Math.log(x) / Math.log(10) + Math.sin(x);
}
var epsilon = 1e-8;

//var dichotomyResult = dichotomy.search(epsilon, epsilon / 2, 2, 7, f);
//alertFormatted(dichotomyResult, 'Dichotomy');
//
//var goldenSectionResult = goldenSection.search(epsilon, 2, 7, f);
//alertFormatted(goldenSectionResult, 'Golden section');
//
var fibonacciResult = fibonacci.search(epsilon, 2, 7, f);
alertFormatted(fibonacciResult, 'Fibonacci');

//var quadraticInterpolationResult = quadraticInterpolation.search(epsilon, 2, 7, f);
//alertFormatted(quadraticInterpolationResult, 'Quadratic interpolation');
//
function alertFormatted(result, method) {
    alert(method + '\n' +
          'Minimum x - ' + result.x + '\n' +
          'Minimum f(x) - ' + result.fx + '\n' +
          'Iterations count - ' + result.iterationsCount + '\n' +
          'Function calculations count - ' + result.functionCalculationsCount);
}

// Test Fibonacci numbers algorithm
//alert(fibonacci.getFibonacciNumber(0) === 1);
//alert(fibonacci.getFibonacciNumber(1) === 1);
//alert(fibonacci.getFibonacciNumber(6) === 13);
//alert(fibonacci.getFibonacciNumber(10) === 89);