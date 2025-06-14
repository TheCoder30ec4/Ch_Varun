import type { AuthenticateCallback, AnyCallback, CallbackEvent, OnCallback, BaseAuthReturn, ToUserLike, BaseUser } from "./types.js";
export declare class Auth<TExtra = {}, TAuthReturn extends BaseAuthReturn = BaseAuthReturn, TUser extends BaseUser = ToUserLike<TAuthReturn>> {
    /**
     * @internal
     * @ignore
     */
    "~handlerCache": {
        authenticate?: AuthenticateCallback<BaseAuthReturn>;
        callbacks?: Record<string, AnyCallback>;
    };
    authenticate<T extends BaseAuthReturn>(cb: AuthenticateCallback<T>): Auth<TExtra, T>;
    on<T extends CallbackEvent>(event: T, callback: OnCallback<T, TUser>): this;
}
export type { Filters as AuthFilters, EventValueMap as AuthEventValueMap, } from "./types.js";
export { HTTPException } from "./error.js";
