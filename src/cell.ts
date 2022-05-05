import { Rectangle } from "two.js/src/shapes/rectangle";
import Two from "two.js";
import { Vector } from "two.js/src/vector";
import { Candidate } from "./candidate";

class Cell {
    alive: boolean;
    toDie: boolean;
    body: Rectangle;
    colorAngle: number;
    colorChangeSpeed: number;
    position: Vector;

    constructor(two: Two, position: Vector, cellEdgeSize: number, cellColor: number, colorChangeSpeed: number) {
        this.alive = true;
        this.toDie = false;
        this.position = position.clone();

        this.body = two.makeRectangle(position.x * cellEdgeSize + cellEdgeSize / 2, position.y * cellEdgeSize + cellEdgeSize / 2, cellEdgeSize, cellEdgeSize);
        this.colorAngle = cellColor;
        this.colorChangeSpeed = colorChangeSpeed;
        this.changeColor(this.colorAngle);
    }

    check(cells: Cell[], candidates: Candidate[]) {
        let aliveNear = 0;
        let start: Vector = new Vector(-1, -1);
        while (start.x <= 1) {
            start.y = -1;
            while (start.y <= 1) {
                if (start.x === 0 && start.y === 0) {
                    start.y++;
                    continue;
                }
                let n = cells.find(cell =>
                    cell.position.equals(Vector.add(this.position, start))
                    && cell.alive)
                if (n) {
                    aliveNear++;
                } else {
                    let newCandidate = candidates.find(cell => cell.position.equals(Vector.add(this.position, start)));
                    if (newCandidate) {
                        newCandidate.aliveNear++;
                    }
                    candidates.push({
                        position: Vector.add(this.position, start),
                        aliveNear: 1
                    });
                }
                start.y++;
            }
            start.x++;
        }

        if (aliveNear < 2 || aliveNear > 3) {
            this.toDie = true;
            this.body.fill = '#009900';
        }

        this.changeColor(this.colorAngle + this.colorChangeSpeed);
    }

    changeColor(angle: number) {
        this.colorAngle = angle;
        this.body.fill = `hsl(${angle}, 100%, 50%)`;
    }
}

export {
    Cell
}