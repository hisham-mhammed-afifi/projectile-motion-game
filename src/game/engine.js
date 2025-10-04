import Matter from "matter-js";

export function createEngine() {
    const engine = Matter.Engine.create();
    const world = engine.world;

    // Gravity defaults to earth-like (y: 1)
    world.gravity.y = 1;

    return { engine, world };
}
