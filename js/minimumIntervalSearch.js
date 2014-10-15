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
    getFibonacciNumber: function (n) {
        var sqrt5 = Math.sqrt(5);
        return (Math.pow((1 + sqrt5) / 2, n) - Math.pow((1 - sqrt5) / 2, n)) / sqrt5;
    },

    search : function (calculationsCount, intervalStart, intervalEnd, f) {
        var result = {
            functionCalculationsCount: 2 + calculationsCount
        };

        var nthNumber = this.getFibonacciNumber(calculationsCount);
        var nthPlusTwoNumber = this.getFibonacciNumber(calculationsCount + 2);

        var u = intervalStart + nthNumber / nthPlusTwoNumber * (intervalEnd - intervalStart);
        var v = intervalStart + intervalEnd - u;

        var fu = f(u);
        var fv = f(v);

        for (var i = 0; i < calculationsCount; i++) {
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

//var quadraticInterpolation = {
//    search : function (calculationsCount, intervalStart, intervalEnd, f) {
//        var result = {
//            functionCalculationsCount: 2 + calculationsCount
//        };
//
//        var nthNumber = this.getFibonacciNumber(calculationsCount);
//        var nthPlusTwoNumber = this.getFibonacciNumber(calculationsCount + 2);
//
//        var u = intervalStart + nthNumber / nthPlusTwoNumber * (intervalEnd - intervalStart);
//        var v = intervalStart + intervalEnd - u;
//
//        var fu = f(u);
//        var fv = f(v);
//
//        for (var i = 0; i < calculationsCount; i++) {
//            if (fu <= fv) {
//                result.x = u;
//                result.fx = fu;
//
//                intervalEnd = v;
//                v = u;
//                fv = fu;
//                u = intervalStart + intervalEnd - v;
//                fu = f(u);
//            } else {
//                result.x = v;
//                result.fx = fv;
//
//                intervalStart = u;
//                u = v;
//                fu = fv;
//                v = intervalStart + intervalEnd - u;
//                fv = f(v);
//            }
//        }
//
//        return result;
//    }
//};

//var interval = minimumIntervalSearch.searchInterval(3, f, 0.01);
//alert(interval.start + '   ' + interval.end);

//var dichotomyResult = dichotomy.search(1e-4, 1e-4 / 2, 2, 7, f);
//alert(dichotomyResult.x + '   ' + dichotomyResult.iterationsCount);

//var goldenSectionResult = goldenSection.search(1e-4, 2, 7, f);
//alert(goldenSectionResult.x + '   ' + goldenSectionResult.iterationsCount);

//var fibonacciResult = fibonacci.search(20, 2, 7, f);
//alert(fibonacciResult.x + '   ' + fibonacciResult.functionCalculationsCount);