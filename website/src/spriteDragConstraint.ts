import * as Matter from 'matter-js'

export class SpriteDragConstraint {
    type: string;
    mouse: Matter.Mouse;
    element: HTMLCanvasElement;
    body: Matter.Body;
    constraint: Matter.Constraint;
    collisionFilter: {
        category: number,
        mask: number,
        group: number
    }
    constructor(engine: Matter.Engine, canvas: HTMLCanvasElement) {
        this.type = 'spriteDragConstraint';
        this.mouse = Matter.Mouse.create(canvas);
        this.element = canvas;
        this.body = null;
        this.constraint = Matter.Constraint.create({ 
            label: 'Sprite Drag Constraint',
            pointA: this.mouse.position,
            pointB: { x: 0, y: 0 },
            length: 0.01, 
            stiffness: 0.1,
            render: {
                strokeStyle: '#90EE90',
                lineWidth: 3
            }
        });
        this.collisionFilter = {
            category: 0x0001,
            mask: 0xFFFFFFFF,
            group: 0
        }
        let that = this;
        Matter.Events.on(engine, 'beforeUpdate', function() {
            var allBodies = Matter.Composite.allBodies(engine.world);
            that.#update(allBodies);
            //that.#triggerEvents();
        });
    }

    #update(bodies: Matter.Body[]) {
        let body = null;
        if (this.mouse.button === 0) {
            if (!this.constraint.bodyB) {
                for (var i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (body.plugin.drag 
                            && Matter.Bounds.contains(body.bounds, this.mouse.position) 
                            && Matter.Detector.canCollide(body.collisionFilter, this.collisionFilter)) {
                        
                        for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                            var part = body.parts[j];
                            if (Matter.Vertices.contains(part.vertices, this.mouse.position)) {
                                this.constraint.pointA = this.mouse.position;
                                this.constraint.bodyB = this.body = body;
                                this.constraint.pointB = { x: this.mouse.position.x - body.position.x, y: this.mouse.position.y - body.position.y };
                                //this.constraint.angleB = body.angle;
                                
                                Matter.Sleeping.set(body, false);
                                Matter.Events.trigger(this, 'startdrag', { mouse: this.mouse, body: body });

                                break;
                            }
                        }
                    }
                }
            } else {
                Matter.Sleeping.set(this.constraint.bodyB, false);
                this.constraint.pointA = this.mouse.position;
            }
        } else {
            this.constraint.bodyB = this.body = null;
            this.constraint.pointB = null;

            if (body)
                Matter.Events.trigger(this, 'enddrag', { mouse: this.mouse, body: body });
        }
    };

    /**#triggerEvents() {
        let mouseEvents = this.mouse.sourceEvents;
        if (mouseEvents.mousemove)
            Matter.Events.trigger(this, 'mousemove', { mouse: this.mouse });

        if (mouseEvents.mousedown)
            Matter.Events.trigger(this, 'mousedown', { mouse: this.mouse });

        if (mouseEvents.mouseup)
            Matter.Events.trigger(this, 'mouseup', { mouse: this.mouse });

        // reset the mouse state ready for the next step
        Matter.Mouse.clearSourceEvents(this.mouse);
    };*/
}
