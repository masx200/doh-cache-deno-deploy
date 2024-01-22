import { parse, stringify } from "cache-control-parser";
import {
    Context, // 日志记录中间件
    Middleware,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";

export function set_cache_control_max_age_greater_than(
    min_age: number,
    condition: (params: Context) => boolean,
): Middleware {
    return async function (params: Context, next): Promise<void> {
        await next();
        if (!condition(params)) return;
        const cacheControlHeader = params.response.headers.get("cache-control");
        //设置cache-control不得小于min_age
        if (cacheControlHeader) {
            const cacheControl = parse(cacheControlHeader);
            if (cacheControl["max-age"]) {
                if (cacheControl["max-age"] < min_age) {
                    params.response.headers.set(
                        "cache-control",
                        stringify({
                            "max-age": min_age,
                        }),
                    );
                }
            }
        } else {
            params.response.headers.set(
                "cache-control",
                stringify({
                    "max-age": min_age,
                }),
            );
            return;
        }
        return;
    };
}