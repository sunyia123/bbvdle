import { windowProperties } from "../window";
import { ActivationLayer } from "./activationlayer";
import { Draggable } from "./draggable";
import { Point } from "./shape";

export abstract class Activation extends Draggable {
    public static defaultLocation: Point = new Point(50, 150);

    public layer: ActivationLayer = null;
    public abstract activationType: string;
    public body: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    constructor(color: string, defaultLocation: Point) {
        super(defaultLocation);

        this.body = this.svgComponent.append<SVGGraphicsElement>("path")
                                     .attr("d", "M0 0 h10 v10 h8 v20 h-26 v-20 h8 v-10 Z")
                                     .style("fill", color)
                                     .style("cursor", "pointer");

        this.makeDraggable();
    }

    public select(): void {
        super.select();
        this.body.style("stroke", "yellow").style("stroke-width", "2");
    }

    public unselect(): void {
        super.unselect();
        this.body.style("stroke", null).style("stroke-width", null);
    }

    public delete(): void {
        // Remove the activation from the layer then delete the activation.
        if (this.layer != null) {
            this.layer.removeActivation();
            this.layer = null;
        }
        super.delete();
    }

    public moveAction(): void {
        let closestLayer: ActivationLayer;
        let minDist = Infinity;
        if (this.layer == null) {
            // Find the closest layer and its distances
            for (const activationLayer of windowProperties.activationLayers) {
                const dist = activationLayer.getPosition().distance(this.getPosition());
                if (dist < minDist) {
                    minDist = dist;
                    closestLayer = activationLayer;
                }
            }
        } else {
            closestLayer = this.layer;
            minDist = this.layer.getPosition().distance(this.getPosition());
        }

        // Snap activations if they are close enough
        const snappingDistance = 20;
        if (minDist < snappingDistance) {
            // if snap happens remove old connection
            if (this.layer != null) {
                this.layer.removeActivation();
                this.layer = null;
            }
            closestLayer.addActivation(this);
            this.layer = closestLayer;
            this.draggedX = this.layer.draggedX;
            this.draggedY = this.layer.draggedY;

        } else if (this.layer != null) { // otherwise, if we unsnap update as appropriate
            this.layer.removeActivation();
            this.layer = null;
        }
    }

}

export class Relu extends Activation {
    public activationType: string = "relu";

    constructor(defaultLocation: Point = Point.randomPoint(50, 50, Activation.defaultLocation)) {

        super("#B29F9C", defaultLocation);

        this.svgComponent.append("path").attr("d", "M-5 20 l10 0 l7 -7")
                                        .style("stroke", "black")
                                        .style("stroke-width", 3)
                                        .style("fill", "none")
                                        .style("cursor", "pointer");

    }

    public getHoverText(): string { return "relu"; }

}

export class Sigmoid extends Activation {
    public activationType: string = "sigmoid";

    constructor(defaultLocation: Point = Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#F2A878", defaultLocation);

        this.svgComponent.append("path").attr("d", "M -3 20 Q 5 20 5 17 Q 5 14 13 14 ")
        .style("stroke", "black")
        .style("stroke-width", 3)
        .style("fill", "none")
        .style("cursor", "pointer");

    }

    public getHoverText(): string { return "sigmoid"; }

}

export class Tanh extends Activation {
    public activationType: string = "tanh";

    constructor(defaultLocation: Point = Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#A3A66D", defaultLocation);

        this.svgComponent.append("path").attr("d", "M -4 26 Q 5 26 5 20 Q 5 14 14 14 ")
        .style("stroke", "black")
        .style("stroke-width", 3)
        .style("fill", "none")
        .style("cursor", "pointer");

    }

    public getHoverText(): string { return "tanh"; }
}

export class Softmax extends Activation {
    public activationType: string = "softmax";

    constructor(defaultLocation: Point = Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#FFFFFF", defaultLocation);

        // TODO: curvature and color are wrong
        this.svgComponent.append("path").attr("d", "M -4 26 Q 5 26 5 20 Q 5 14 14 14 ")
        .style("stroke", "black")
        .style("stroke-width", 3)
        .style("fill", "none")
        .style("cursor", "pointer");

    }

    public getHoverText(): string { return "softmax"; }
}
