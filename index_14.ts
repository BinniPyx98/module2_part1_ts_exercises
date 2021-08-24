

function toFunctional<T extends Function>(func: T): Function {
    const fullArgCount = func.length;
    function createSubFunction(curriedArgs: unknown[]) {
        return function(this: unknown) {
            const newCurriedArguments = curriedArgs.concat(Array.from(arguments));
            if (newCurriedArguments.length > fullArgCount) {
                throw new Error('Too many arguments');
            }
            if (newCurriedArguments.length === fullArgCount) {
                return func.apply(this, newCurriedArguments);
            }
            return createSubFunction(newCurriedArguments);
        };
    }
    return createSubFunction([]);
}

interface MapperFunc<I, O> {
    (): MapperFunc<I, O>;
    (input: I[]): O[];
}

interface MapFunc {
    (): MapFunc;
    <I, O>(mapper: (item: I) => O): MapperFunc<I, O>;
    <I, O>(mapper: (item: I) => O, input: I[]): O[];
}


export const map = toFunctional(<I, O>(fn: (arg: I) => O, input: I[]) => input.map(fn)) as MapFunc;


interface FiltererFunc<I> {
    (): FiltererFunc<I>;
    (input: I[]): I[];
}

interface FilterFunc {
    (): FilterFunc;
    <I>(filterer: (item: I) => boolean): FiltererFunc<I>;
    <I>(filterer: (item: I) => boolean, input: I[]): I[];
}


export const filter = toFunctional(<I>(fn: (item: I) => boolean, input: I[]) => input.filter(fn)) as FilterFunc;

interface ReducerInitialFunc<I, O> {
    (): ReducerInitialFunc<I, O>;
    (input: I[]): O;
}

interface ReducerFunc<I, O> {
    (): ReducerFunc<I, O>;
    (initialValue: O): ReducerInitialFunc<I, O>;
    (initialValue: O, input: I[]): O;
}

interface ReduceFunc {
    (): ReduceFunc;
    <I, O>(reducer: (acc: O, val: I) => O): ReducerFunc<I, O>;
    <I, O>(reducer: (acc: O, val: I) => O, initialValue: O): ReducerInitialFunc<I, O>;
    <I, O>(reducer: (acc: O, val: I) => O, initialValue: O, input: I[]): O;
}


export const reduce = toFunctional(
    <I, O>(reducer: (acc: O, item: I) => O, initialValue: O, input: I[]) => input.reduce(reducer, initialValue)
) as ReduceFunc;

interface ArithmeticArgFunc {
    (): ArithmeticArgFunc;
    (b: number): number;
}

interface ArithmeticFunc {
    (): ArithmeticFunc;
    (a: number): ArithmeticArgFunc;
    (a: number, b: number): number;
}


export const add = toFunctional((a: number, b: number) => a + b) as ArithmeticFunc;


export const subtract = toFunctional((a: number, b: number) => a - b) as ArithmeticFunc;

interface PropNameFunc<K extends string> {
    (): PropNameFunc<K>;
    <O extends {[key in K]: O[K]}>(obj: O): O[K];
}

interface PropFunc {
    (): PropFunc;
    <K extends string>(propName: K): PropNameFunc<K>;
    <O, K extends keyof O>(propName: K, obj: O): O[K];
}
export const prop = toFunctional(<O, K extends keyof O>(obj: O, propName: K): O[K] => obj[propName]) as PropFunc;

type F<A extends unknown[], R> = (...args: A) => R;
type TR<I, O> = (arg: I) => O;

interface PipeFunc {
    (): PipeFunc;
    <A1 extends unknown[], R1>(f: F<A1, R1>): (...args: A1) => R1;
    <A1 extends unknown[], R1, R2>(f: F<A1, R1>, tr1: TR<R1, R2>): (...args: A1) => R2;
    <A1 extends unknown[], R1, R2, R3>(f: F<A1, R1>, tr1: TR<R1, R2>, tr2: TR<R2, R3>): (...args: A1) => R3;
    <A1 extends unknown[], R1, R2, R3, R4>(
        f: F<A1, R1>, tr1: TR<R1, R2>, tr2: TR<R2, R3>, tr3: TR<R3, R4>
    ): (...args: A1) => R4;
    <A1 extends unknown[], R1, R2, R3, R4, R5>(
        f: F<A1, R1>, tr1: TR<R1, R2>, tr2: TR<R2, R3>, tr3: TR<R3, R4>, tr4: TR<R4, R5>
    ): (...args: A1) => R5;
}

export const pipe: PipeFunc = function (...functions: Function[]) {
    if (arguments.length === 0) {
        return pipe;
    }
    return function subFunction() {
        let nextArguments = Array.from(arguments);
        let result;
        for (const func of functions) {
            result = func(...nextArguments);
            nextArguments = [result];
        }
        return result;
    };
};
