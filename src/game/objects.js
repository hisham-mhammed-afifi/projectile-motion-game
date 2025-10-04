import Matter from "matter-js";

export function createBall(x, y, radius = 20) {
    return Matter.Bodies.circle(x, y, radius, {
        restitution: 0.6, // bounciness
        label: "ball",
    });
}

export function createGround(width, height) {
    return Matter.Bodies.rectangle(width / 2, height - 20, width, 40, {
        isStatic: true,
        label: "ground",
    });
}
