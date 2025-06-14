import { ThreadState } from "../schema.js";
interface Node<StateType = any> {
    type: "node";
    value: ThreadState<StateType>;
    path: string[];
}
interface ValidFork<StateType = any> {
    type: "fork";
    items: Array<ValidSequence<StateType>>;
}
interface ValidSequence<StateType = any> {
    type: "sequence";
    items: [Node<StateType>, ...(Node<StateType> | ValidFork<StateType>)[]];
}
export type CheckpointBranchPath = string[];
export type MessageBranch = {
    current: CheckpointBranchPath;
    options: CheckpointBranchPath[];
};
export declare function DebugSegmentsView(props: {
    sequence: ValidSequence<ThreadState>;
}): import("react/jsx-runtime").JSX.Element;
export {};
