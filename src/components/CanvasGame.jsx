import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { createEngine } from "../game/engine";
import { createBall, createGround } from "../game/objects";

export default function CanvasGame() {
    const canvasRef = useRef(null);
    const [angle, setAngle] = useState(45);
    const [power, setPower] = useState(15);

    useEffect(() => {
        const { engine, world } = createEngine();
        const renderCanvas = canvasRef.current;
        const ctx = renderCanvas.getContext("2d");

        const width = renderCanvas.width;
        const height = renderCanvas.height;

        // Ball + ground
        const ball = createBall(100, height - 60);
        const ground = createGround(width, height);

        Matter.World.add(world, [ball, ground]);

        // Launch ball on spacebar
        const handleKey = (e) => {
            if (e.code === "Space") {
                const rad = (angle * Math.PI) / 180;
                const velocity = {
                    x: power * Math.cos(rad),
                    y: -power * Math.sin(rad), // negative y = up
                };
                Matter.Body.setVelocity(ball, velocity);
            }
        };
        window.addEventListener("keydown", handleKey);

        // Game loop
        const loop = () => {
            Matter.Engine.update(engine, 1000 / 60);

            ctx.clearRect(0, 0, width, height);

            // Draw ball
            ctx.beginPath();
            ctx.arc(ball.position.x, ball.position.y, ball.circleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();

            // Draw ground
            ctx.fillStyle = "green";
            ctx.fillRect(0, height - 40, width, 40);

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
                        onChange={(e) => setAngle(Number(e.target.value))}
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
                        onChange={(e) => setPower(Number(e.target.value))}
                    />
                </label>
                <p>Press <b>Spacebar</b> to launch!</p>
            </div>
        </div>
    );
}
