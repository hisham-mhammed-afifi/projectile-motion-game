export function getTrajectoryPoints(v0, angle, steps = 50) {
    const g = 9.8;
    const rad = angle * (Math.PI / 180);
    const points = [];
    for (let t = 0; t < steps; t++) {
        const time = t * 0.1;
        const x = v0 * Math.cos(rad) * time;
        const y = v0 * Math.sin(rad) * time - 0.5 * g * time * time;
        points.push({ x, y });
    }
    return points;
}