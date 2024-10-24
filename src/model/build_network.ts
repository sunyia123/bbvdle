import * as tf from "@tensorflow/tfjs";

import { displayError } from "../ui/error";
import { Layer } from "../ui/shapes/layer";
import { Input } from "../ui/shapes/layers/input";

/**
 * Wrap errors from networkDAG
 * @param input an input layer that is the root of the computational graph
 */
export function buildNetworkDAG(input: Input): tf.LayersModel {
    const toposorted = topologicalSort(input);
    return networkDAG(toposorted);
}

/**
 * Wrap model generation and produce a summary.
 * @param toposorted topologically sorted list of layers
 */
function networkDAG(toposorted: Layer[]): tf.LayersModel {
    const model = generateTfjsModel(toposorted);
    // tslint:disable-next-line:no-console
    console.log(model.summary());
    return model;
}

/**
 * Clone a full computational graph
 * @param input an input layer that is the root of the computational graph
 * @param newInput the input that will be the root of the cloned graph
 */
export function cloneNetwork(input: Input, newInput: Input): void {
    // Initialize queues, dags, and parents (visited)

    const oldId2Clone: Map<number, Layer> = new Map<number, Layer>();
    oldId2Clone.set(input.uid, newInput);

    const queue: Layer[] = [input];
    const visited: Set<Layer> = new Set();

    let newLayer: Layer;
    while (queue.length !== 0) {
        const current = queue.shift();

        // Clone layer
        if (current !== input) {
            if (!(current.uid in oldId2Clone)) {
                newLayer = current.clone();
                oldId2Clone.set(current.uid, newLayer);
            } else {
                newLayer = oldId2Clone.get(current.uid);
            }

            // Add in cloned parent/child relations
            for (const p of current.parents) {
                if (!(p.uid in oldId2Clone)) {
                    oldId2Clone.set(p.uid, p.clone());
                }
                const newParent = oldId2Clone.get(p.uid);
                newParent.addChild(newLayer);
                newLayer.addParent(newParent);
            }
        } else {
            newLayer = newInput;
        }

        // Continue BFS
        for (const child of current.children) {

            if (!visited.has(child)) {
                queue.push(child);
                visited.add(child);
            }
        }
    }
}

/**
 * Topologically sort a graph of layers that are rooted at the input.
 * @param input an input layer that is the root of the computational graph
 * @param showErrors decide whether or not to surface errors to the UI
 */
export function topologicalSort(input: Input, showErrors: boolean = true): Layer[] {
    // Kahn's algorithm
    const sorted: Layer[] = [];
    const visited: Set<Layer> = new Set();
    const frontier: Layer[] = [input];
    // This is to detect if we have a branch that doesn't start from input
    const potentialBranch: Set<number> = new Set();

    while (frontier.length > 0) {
        const layer = frontier.pop();
        visited.add(layer);
        sorted.push(layer);

        if (potentialBranch.has(layer.uid)) {
            potentialBranch.delete(layer.uid);
        }

        for (const child of layer.children) {

            // Check not a cycle
            const childIndex = sorted.indexOf(child);

            if (childIndex >= 0 && childIndex < sorted.indexOf(layer)) {
                displayError(new Error("Cannot have backwards edges"));
            }

            // Check if we've already visited all parents
            let canAdd = true;
            for (const parent of child.parents) {

                canAdd = visited.has(parent);
                if (!canAdd) {
                    potentialBranch.add(parent.uid);
                    break;
                }
            }

            // All dependencies are added then add child
            if (canAdd) {
                frontier.push(child);
            }
        }
    }

    // Either there are layers with no parents (other than input), there is a cycle, or output is never reached
    if (sorted[sorted.length - 1].layerType !== "Output" && showErrors) {

        if (potentialBranch.size > 0) {
            displayError(new Error("All layers must have input as an ancestor."));
        } else {
            displayError(new Error("Something is wrong with your network architecture."));
        }
    }

    return sorted;
}

/**
 * Creates corresponding tfjs model.
 * @param sorted topologically sorted list of layers
 */
export function generateTfjsModel(sorted: Layer[]): tf.LayersModel {
    sorted.forEach((layer) => layer.generateTfjsLayer());
    const input = sorted[0].getTfjsLayer();
    const output = sorted[sorted.length - 1].getTfjsLayer();
    return tf.model({ inputs: input, outputs: output });
}
