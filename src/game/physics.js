import Matter from "matter-js";

/**
 * Predict the projectile path using a ghost Matter.js engine.
 *
 * @param {Matter.Engine} engine - Your main Matter.js engine.
 * @param {Matter.Body} sourceBody - The projectile or body to clone (for position & mass reference).
 * @param {Object} velocity - Initial velocity { x, y } in pixels per simulation tick.
 * @param {Object} [options]
 * @param {number} [options.steps=200] - Number of simulation steps to compute.
 * @param {number} [options.timeStep=1000/60] - Step duration in ms (same as engine.timing.delta).
 * @param {number} [options.radius=5] - Radius of ghost projectile for simulation.
 * @returns {Array<{x:number, y:number}>} - Predicted path positions.
 */
export function predictProjectilePath(engine, sourceBody, velocity, options = {}) {
    const steps = options.steps ?? 200;
    const timeStep = options.timeStep ?? 1000 / 60;
    const radius = options.radius ?? 5;

    // Create isolated ghost engine
    const ghost = Matter.Engine.create();
    ghost.gravity.y = engine.gravity.y;
    ghost.gravity.x = engine.gravity.x;
    ghost.gravity.scale = engine.gravity.scale;

    // Create ghost projectile at same position
    const projectile = Matter.Bodies.circle(sourceBody.position.x, sourceBody.position.y, radius, {
        isSensor: true, // doesn't collide in ghost world
        frictionAir: sourceBody.frictionAir ?? 0,
        restitution: sourceBody.restitution ?? 0,
        mass: sourceBody.mass ?? 1,
    });

    // Set initial velocity
    Matter.Body.setVelocity(projectile, { x: velocity.x, y: velocity.y });

    // Add projectile to ghost world
    Matter.World.add(ghost.world, projectile);

    const positions = [];

    // Step ghost engine forward and record positions
    for (let i = 0; i < steps; i++) {
        Matter.Engine.update(ghost, timeStep);
        positions.push({ x: projectile.position.x, y: projectile.position.y });
    }

    return positions;
}
