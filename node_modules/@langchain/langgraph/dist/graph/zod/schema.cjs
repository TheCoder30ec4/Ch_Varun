"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateTypeSchema = getStateTypeSchema;
exports.getUpdateTypeSchema = getUpdateTypeSchema;
exports.getInputTypeSchema = getInputTypeSchema;
exports.getOutputTypeSchema = getOutputTypeSchema;
exports.getConfigTypeSchema = getConfigTypeSchema;
const json_schema_1 = require("@langchain/core/utils/json_schema");
const meta_js_1 = require("./meta.cjs");
const PartialStateSchema = Symbol.for("langgraph.state.partial");
function isGraphWithZodLike(graph) {
    if (!graph || typeof graph !== "object")
        return false;
    if (!("builder" in graph) ||
        typeof graph.builder !== "object" ||
        graph.builder == null) {
        return false;
    }
    return true;
}
function applyJsonSchemaExtrasFromDescription(schema) {
    if (Array.isArray(schema)) {
        return schema.map(applyJsonSchemaExtrasFromDescription);
    }
    if (typeof schema === "object" && schema != null) {
        const output = Object.fromEntries(Object.entries(schema).map(([key, value]) => [
            key,
            applyJsonSchemaExtrasFromDescription(value),
        ]));
        if ("description" in output &&
            typeof output.description === "string" &&
            output.description.startsWith(meta_js_1.META_EXTRAS_DESCRIPTION_PREFIX)) {
            const strMeta = output.description.slice(meta_js_1.META_EXTRAS_DESCRIPTION_PREFIX.length);
            delete output.description;
            Object.assign(output, JSON.parse(strMeta));
        }
        return output;
    }
    return schema;
}
function toJsonSchema(schema) {
    return applyJsonSchemaExtrasFromDescription((0, json_schema_1.toJsonSchema)(schema));
}
/**
 * Get the state schema for a graph.
 * @param graph - The graph to get the state schema for.
 * @returns The state schema for the graph.
 */
function getStateTypeSchema(graph, registry = meta_js_1.schemaMetaRegistry) {
    if (!isGraphWithZodLike(graph))
        return undefined;
    const schemaDef = graph.builder._schemaRuntimeDefinition;
    if (!schemaDef)
        return undefined;
    return toJsonSchema(registry.getExtendedChannelSchemas(schemaDef, {
        withJsonSchemaExtrasAsDescription: true,
    }));
}
/**
 * Get the update schema for a graph.
 * @param graph - The graph to get the update schema for.
 * @returns The update schema for the graph.
 */
function getUpdateTypeSchema(graph, registry = meta_js_1.schemaMetaRegistry) {
    if (!isGraphWithZodLike(graph))
        return undefined;
    const schemaDef = graph.builder._schemaRuntimeDefinition;
    if (!schemaDef)
        return undefined;
    return toJsonSchema(registry.getExtendedChannelSchemas(schemaDef, {
        withReducerSchema: true,
        withJsonSchemaExtrasAsDescription: true,
        asPartial: true,
    }));
}
/**
 * Get the input schema for a graph.
 * @param graph - The graph to get the input schema for.
 * @returns The input schema for the graph.
 */
function getInputTypeSchema(graph, registry = meta_js_1.schemaMetaRegistry) {
    if (!isGraphWithZodLike(graph))
        return undefined;
    let schemaDef = graph.builder._inputRuntimeDefinition;
    if (schemaDef === PartialStateSchema) {
        // No need to pass `.partial()` here, that's being done by `applyPlugin`
        schemaDef = graph.builder._schemaRuntimeDefinition;
    }
    if (!schemaDef)
        return undefined;
    return toJsonSchema(registry.getExtendedChannelSchemas(schemaDef, {
        withReducerSchema: true,
        withJsonSchemaExtrasAsDescription: true,
        asPartial: true,
    }));
}
/**
 * Get the output schema for a graph.
 * @param graph - The graph to get the output schema for.
 * @returns The output schema for the graph.
 */
function getOutputTypeSchema(graph, registry = meta_js_1.schemaMetaRegistry) {
    if (!isGraphWithZodLike(graph))
        return undefined;
    const schemaDef = graph.builder._outputRuntimeDefinition;
    if (!schemaDef)
        return undefined;
    return toJsonSchema(registry.getExtendedChannelSchemas(schemaDef, {
        withJsonSchemaExtrasAsDescription: true,
    }));
}
/**
 * Get the config schema for a graph.
 * @param graph - The graph to get the config schema for.
 * @returns The config schema for the graph.
 */
function getConfigTypeSchema(graph, registry = meta_js_1.schemaMetaRegistry) {
    if (!isGraphWithZodLike(graph))
        return undefined;
    const configDef = graph.builder._configRuntimeSchema;
    if (!configDef)
        return undefined;
    return toJsonSchema(registry.getExtendedChannelSchemas(configDef, {
        withJsonSchemaExtrasAsDescription: true,
    }));
}
//# sourceMappingURL=schema.js.map