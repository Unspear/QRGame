import * as Matter from 'matter-js'
import { Entity } from './entity';
import { Point } from './util'
import { INPUT_PHYSICS_GROUP, NORMAL_PHYSICS_GROUP } from './constants';

export class PhysicsInput {
    type: string;
    element: HTMLCanvasElement;
    constraint: Matter.Constraint;
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
        this.pointerId = -1;
        Matter.Composite.add(engine.world, this.constraint);
    }
    #getOverlappingEntities(matterEngine: Matter.Engine, pos: Point, group: number): {entity: Entity, body: Matter.Body}[] {
        let overlapped = [];
        let bodies = Matter.Composite.allBodies(matterEngine.world);
        for (let body of bodies) {
            // Broad phase
            if (body.plugin.entity 
                    && Matter.Bounds.contains(body.bounds, pos) 
                    && Matter.Detector.canCollide(body.collisionFilter, {category: 0, mask: 0, group: group})) {
                // Narrow phase
                for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                    if (Matter.Vertices.contains(body.parts[j].vertices, pos)) {
                        overlapped.push({entity: body.plugin.entity, body: body});
                        break;
                    }
                }
            }
        }
        return overlapped;
    }
    onPointerDown(matterEngine: Matter.Engine, pointerId: number, pos: Point) {
        for(const overlap of this.#getOverlappingEntities(matterEngine, pos, NORMAL_PHYSICS_GROUP)) {
            // Try Drag
            if (!this.constraint.bodyB && overlap.entity.physics.drag) {
                // Start drag
                this.constraint.pointA = pos;
                this.constraint.bodyB = overlap.body;
                this.constraint.pointB = { x: pos.x - overlap.body.position.x, y: pos.y - overlap.body.position.y };
                this.pointerId = pointerId;
                Matter.Sleeping.set(overlap.body, false);
            }
        }
        for(const overlap of this.#getOverlappingEntities(matterEngine, pos, INPUT_PHYSICS_GROUP)) {
            // Try Tap
            if (overlap.entity.input.enabled && overlap.entity.input.press instanceof Function) {
                overlap.entity.input.press();
            }
        }
    }
    onPointerFrame(matterEngine: Matter.Engine, downPointers: Map<number, Point>) {
        let entities = new Set<Entity>();
        for (let pointer of downPointers) {
            this.#getOverlappingEntities(matterEngine, pointer[1], INPUT_PHYSICS_GROUP).forEach(item => entities.add(item.entity))
        }
        for (const entity of entities) {
            if (entity.input.enabled && entity.input.hold instanceof Function) {
                entity.input.hold();
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
