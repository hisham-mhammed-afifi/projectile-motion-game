import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { createEngine } from "../game/engine";
import { createBall, createGround, createTarget } from "../game/objects";
import { predictProjectilePath } from "../game/physics";

export default function CanvasGame() {
    const canvasRef = useRef(null);
    const [angle, setAngle] = useState(45);
    const [power, setPower] = useState(15);
    const [score, setScore] = useState(0);
    const [ballLaunched, setBallLaunched] = useState(false);

    useEffect(() => {
        const { engine, world } = createEngine();
        const renderCanvas = canvasRef.current;
        const ctx = renderCanvas.getContext("2d");

        const width = renderCanvas.width;
        const height = renderCanvas.height;

        // Ball + ground
        const ball = createBall(100, height - 60);
        const ground = createGround(width, height);

        // Targets
        const targets = [
            createTarget(600, height - 100, 25),
            createTarget(700, height - 150, 25),
            createTarget(500, height - 200, 25),
        ];

        const rad = (angle * Math.PI) / 180;

        const velocity = {
            x: power * Math.cos(rad),
            y: -power * Math.sin(rad),
        };

        Matter.Composite.add(world, [ball, ground, ...targets]);

        // Collision detection
        Matter.Events.on(engine, "collisionStart", (event) => {
            event.pairs.forEach(({ bodyA, bodyB }) => {
                const labels = [bodyA.label, bodyB.label];
                if (labels.includes("ball") && labels.includes("target")) {
                    setScore((prev) => prev + 10);

                    const target = bodyA.label === "target" ? bodyA : bodyB;
                    target.hit = true;
                    setTimeout(() => {
                        console.log("Removing target");
                        Matter.Composite.remove(world, target);
                    }, 300);
                }
            });
        });

        // Launch ball
        const handleKey = (e) => {
            if (e.code === "Space" && !ballLaunched) {


                Matter.Body.setVelocity(ball, velocity);
                setBallLaunched(true);
            }
        };
        window.addEventListener("keydown", handleKey);

        // Game loop
        const loop = () => {
            Matter.Engine.update(engine, 1000 / 60);
            ctx.clearRect(0, 0, width, height);

            // Draw ground
            ctx.fillStyle = "green";
            ctx.fillRect(0, height - 40, width, 40);

            // Draw targets
            targets.forEach((t) => {
                ctx.beginPath();
                ctx.arc(t.position.x, t.position.y, t.circleRadius, 0, 2 * Math.PI);
                ctx.fillStyle = t.hit ? "yellow" : "blue";
                ctx.fill();
                if (t.hit) t.hit = false;
            });

            // Draw ball
            ctx.beginPath();
            ctx.arc(ball.position.x, ball.position.y, ball.circleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();

            // Draw predicted trajectory BEFORE launch
            if (!ballLaunched) {
                const trajPoints = predictProjectilePath(engine, ball, velocity, {
                    steps: 300,
                    radius: 5,
                });
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                trajPoints.forEach((p) => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
                    ctx.fill();
                });
            }

            requestAnimationFrame(loop);
        };
        loop();

        return () => {
            window.removeEventListener("keydown", handleKey);
        };
    }, [angle, power]);



    return (
        <div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ border: "1px solid black" }}
            />
            <div style={{ marginTop: "10px" }}>
                <label>
                    Angle: {angle}°
                    <input
                        type="range"
                        min="10"
                        max="80"
                        value={angle}
                        onChange={(e) => {
                            setAngle(Number(e.target.value));
                            setBallLaunched(false); // reset prediction
                        }}
                    />
                </label>
                <br />
                <label>
                    Power: {power}
                    <input
                        type="range"
                        min="5"
                        max="30"
                        value={power}
                        onChange={(e) => {
                            setPower(Number(e.target.value));
                            setBallLaunched(false);
                        }}
                    />
                </label>
                <p>Press <b>Spacebar</b> to launch!</p>
                <h3>Score: {score}</h3>
            </div>
        </div>
    );
}
