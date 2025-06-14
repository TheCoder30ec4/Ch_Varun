"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugSegmentsView = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
function DebugSegmentsView(props) {
    const concatContent = (value) => {
        let content;
        try {
            content = value.values?.messages?.at(-1)?.content ?? "";
        }
        catch {
            content = JSON.stringify(value.values);
        }
        content = content.replace(/(\n|\r\n)/g, "");
        if (content.length <= 23)
            return content;
        return `${content.slice(0, 10)}...${content.slice(-10)}`;
    };
    return ((0, jsx_runtime_1.jsx)("div", { children: props.sequence.items.map((item, index) => {
            if (item.type === "fork") {
                return ((0, jsx_runtime_1.jsx)("div", { children: item.items.map((fork, idx) => {
                        const [first] = fork.items;
                        return ((0, jsx_runtime_1.jsxs)("details", { children: [(0, jsx_runtime_1.jsxs)("summary", { children: ["Fork", " ", (0, jsx_runtime_1.jsxs)("span", { className: "font-mono", children: ["...", first.path.at(-1)?.slice(-4)] })] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-4", children: (0, jsx_runtime_1.jsx)(DebugSegmentsView, { sequence: fork }) })] }, idx));
                    }) }, index));
            }
            if (item.type === "node") {
                return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("pre", { children: ["(", item.value.metadata?.step, ") ...", item.value.checkpoint.checkpoint_id?.slice(-4), " (", item.value.metadata?.source, "): ", concatContent(item.value)] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "border rounded-sm text-sm py-0.5 px-1 text-muted-foreground", onClick: () => console.log(item.path, item.value), children: "console.log" })] }, index));
            }
            return null;
        }) }));
}
exports.DebugSegmentsView = DebugSegmentsView;
