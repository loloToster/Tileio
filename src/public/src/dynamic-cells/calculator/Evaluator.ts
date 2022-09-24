// @ts-ignore
import BigEval from "bigeval"
import Decimal from "Decimal.js"

function p(s: any) {
    return s[0] === "+" ? s.substring(1) : s
}

BigEval.prototype.number = function (str: any) {
    return (str instanceof Decimal) ? str : new Decimal(str)
}

BigEval.prototype.add = function (a: any, b: any) {
    return new Decimal(p(a)).plus(p(b))
}

BigEval.prototype.sub = function (a: any, b: any) {
    return new Decimal(p(a)).minus(p(b))
}

BigEval.prototype.mul = function (a: any, b: any) {
    return new Decimal(p(a)).times(p(b))
}

BigEval.prototype.div = function (a: any, b: any) {
    return new Decimal(p(a)).dividedBy(p(b))
}

BigEval.prototype.pow = function (a: any, b: any) {
    return new Decimal(p(a)).pow(p(b))
}

BigEval.prototype.lessThan = function (a: any, b: any) {
    return a.lessThan(b)
}

BigEval.prototype.lessThanOrEqualsTo = function (a: any, b: any) {
    return a.lessThanOrEqualTo(b)
}

BigEval.prototype.greaterThan = function (a: any, b: any) {
    return a.greaterThan(b)
}

BigEval.prototype.greaterThanOrEqualsTo = function (a: any, b: any) {
    return a.greaterThanOrEqualTo(b)
}

BigEval.prototype.equalsTo = function (a: any, b: any) {
    return a.equals(b)
}

BigEval.prototype.notEqualsTo = function (a: any, b: any) {
    return !a.equals(b)
}

BigEval.prototype.isTruthy = function (a: any) {
    return !a.equals(0)
}

BigEval.prototype.logicalAnd = function (a: any, b: any) {
    if (!a || ((a instanceof Decimal) && a.equals(0)))
        return a

    return b
}

BigEval.prototype.logicalOr = function (a: any, b: any) {
    if (!a || ((a instanceof Decimal) && a.equals(0)))
        return b

    return a
}

BigEval.prototype.mod = function (a: any, b: any) {
    return new Decimal(p(a)).modulo(p(b))
}

BigEval.prototype.shiftLeft = function (a: any, b: any) {
    return a << b
}

BigEval.prototype.shiftRight = function (a: any, b: any) {
    return a >> b
}

BigEval.prototype.and = function (a: any, b: any) {
    return a & b
}

BigEval.prototype.xor = function (a: any, b: any) {
    return a ^ b
}

BigEval.prototype.or = function (a: any, b: any) {
    return a | b
}

// Extra methods

BigEval.prototype.sqrt = function (a: any) {
    return new Decimal(p(a)).sqrt()
}

BigEval.prototype.log = function (a: any) {
    return new Decimal(p(a)).log()
}

BigEval.prototype.ln = function (a: any) {
    return new Decimal(p(a)).ln()
}

BigEval.prototype.exp = function (a: any) {
    return new Decimal(p(a)).exp()
}

export default BigEval
