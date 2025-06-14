import { z as zd } from "zod";
interface ZodLangGraphTypes<T extends zd.ZodTypeAny, Output> {
    reducer<Input = zd.output<T>>(transform: (a: Output, arg: Input) => Output, options?: zd.ZodType<Input>): zd.ZodType<Output, zd.ZodEffectsDef<T>, Input>;
    metadata(payload: {
        langgraph_nodes?: string[];
        langgraph_type?: "prompt";
        [key: string]: unknown;
    }): T;
}
declare module "zod" {
    interface ZodType<Output> {
        /**
         * @deprecated Using the langgraph zod plugin is deprecated and will be removed in future versions
         * Consider upgrading to zod 4 and using the exported langgraph meta registry. {@link langgraphRegistry}
         */
        langgraph: ZodLangGraphTypes<this, Output>;
    }
}
declare module "zod/v3" {
    interface ZodType<Output> {
        /**
         * @deprecated Using the langgraph zod plugin is deprecated and will be removed in future versions
         * Consider upgrading to zod 4 and using the exported langgraph meta registry. {@link langgraphRegistry}
         */
        langgraph: ZodLangGraphTypes<this, Output>;
    }
}
export {};
