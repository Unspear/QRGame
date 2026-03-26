import * as Matter from 'matter-js'
import { Entity } from './entity';
import { Point } from './util'

export class PhysicsInput {
    type: string;
    element: HTMLCanvasElement;
    constraint: Matter.Constraint;
    collisionFilter: {
        category: number,
        mask: number,
        group: number
    }
    pointerId: number;
    constructor(engine: Matter.Engine, canvas: HTMLCanvasElement) {
        this.type = 'spriteDragConstraint';
        this.element = canvas;
        this.constraint = Matter.Constraint.create({ 
            label: 'Sprite Drag Constraint',
            pointA: { x: 0, y: 0 },
            pointB: { x: 0, y: 0 },
            length: 0.01, 
            stiffness: 0.1,
            render: {
                strokeStyle: '#90EE90',
                lineWidth: 3
            },
        });
        this.collisionFilter = {
            category: 0x0001,
            mask: 0xFFFFFFFF,
            group: 0
        }
        this.pointerId = -1;
        Matter.Composite.add(engine.world, this.constraint);
    }
    onPointerDown(matterEngine: Matter.Engine, pointerId: number, pos: Point) {
        let bodies = Matter.Composite.allBodies(matterEngine.world);
        for (let body of bodies) {
            // Broad phase
            if (body.plugin.entity 
                    && Matter.Bounds.contains(body.bounds, pos) 
                    && Matter.Detector.canCollide(body.collisionFilter, this.collisionFilter)) {
                // Narrow phase
                for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                    var part = body.parts[j];
                    if (Matter.Vertices.contains(part.vertices, pos)) {
                        let entity = (body.plugin.entity as Entity);
                        // Try Drag
                        if (!this.constraint.bodyB && entity.physics.drag) {
                            // Start drag
                            this.constraint.pointA = pos;
                            this.constraint.bodyB = body;
                            this.constraint.pointB = { x: pos.x - body.position.x, y: pos.y - body.position.y };
                            this.pointerId = pointerId;
                            Matter.Sleeping.set(body, false);
                        }
                        // Try Tap
                        if (entity.input.enabled && entity.input.tap instanceof Function) {
                            entity.input.tap();
                        }
                    }
                }
            }
        }
    }
    onPointerMove(pointerId: number, pos: Point) {
        if (this.constraint.bodyB && this.pointerId === pointerId) {// If there is a body constrained
            Matter.Sleeping.set(this.constraint.bodyB, false);
            this.constraint.pointA.x = pos.x;
            this.constraint.pointA.y = pos.y;
        }
    };
    onPointerUp(pointerId: number, pos: Point) {
        if (pointerId === this.pointerId) {
            this.constraint.bodyB = null;
            this.pointerId = -1
        }
    }
}
