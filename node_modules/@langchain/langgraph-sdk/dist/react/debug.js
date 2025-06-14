import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export function DebugSegmentsView(props) {
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
    return (_jsx("div", { children: props.sequence.items.map((item, index) => {
            if (item.type === "fork") {
                return (_jsx("div", { children: item.items.map((fork, idx) => {
                        const [first] = fork.items;
                        return (_jsxs("details", { children: [_jsxs("summary", { children: ["Fork", " ", _jsxs("span", { className: "font-mono", children: ["...", first.path.at(-1)?.slice(-4)] })] }), _jsx("div", { className: "ml-4", children: _jsx(DebugSegmentsView, { sequence: fork }) })] }, idx));
                    }) }, index));
            }
            if (item.type === "node") {
                return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("pre", { children: ["(", item.value.metadata?.step, ") ...", item.value.checkpoint.checkpoint_id?.slice(-4), " (", item.value.metadata?.source, "): ", concatContent(item.value)] }), _jsx("button", { type: "button", className: "border rounded-sm text-sm py-0.5 px-1 text-muted-foreground", onClick: () => console.log(item.path, item.value), children: "console.log" })] }, index));
            }
            return null;
        }) }));
}
