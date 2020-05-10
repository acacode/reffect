export type UnknownArgs = unknown[] | [];

export type Func<Args extends UnknownArgs, ReturnType = void> = (...args: Args) => ReturnType;
