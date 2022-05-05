import Two from "two.js";
import { Consts } from "./utils";
import { Cell } from "./cell";
import { Candidate } from "./candidate";
import { Vector } from "two.js/src/vector";

class Program {
    isRunning = false;
    iterationsDone = 0;
    counter: HTMLElement | null = null;
    button: HTMLElement | null = null;
    two: Two;

    candidates: Candidate[] = [];
    cells: Cell[] = [];
    timerElapsed = 0;

    constructor() {
        this.two = new Two({
            fullscreen: true,
            autostart: true
        }).appendTo(document.body);

        this.createGrid();

        window.onload = () => {
            window.addEventListener('click', (e) => {
                const pos = new Vector(
                    Math.round(e.clientX / Consts.CELL_EDGE_SIZE),
                    Math.round(e.clientY / Consts.CELL_EDGE_SIZE));

                this.cells.push(new Cell(this.two, pos, Consts.CELL_EDGE_SIZE, Consts.CELL_COLOR_ANGLE, Consts.COLOR_CHANGE_SPEED));
            });

            this.button = document.querySelector('.panel__button');

            if (!this.button) {
                throw (new Error('Can not find the start/pause button, label .pannel_button'));
            }

            this.button.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                this.toggleGame();
            });

            this.counter = document.querySelector('.panel__counter');
            this.two.bind('update', this.runMainLoop.bind(this));
        }
    }

    public runMainLoop() {
        this.timerElapsed += this.two.timeDelta;
        if (this.timerElapsed >= Consts.FRAME_DELAY) {
            this.cells.forEach(cell => cell.check(this.cells, this.candidates));
            const newCells = this.turnCandidates();
            this.cells = this.removeDead();
            this.cells = [...this.cells, ...newCells];

            this.timerElapsed = 0;
            this.iterationsDone++;
            if (this.counter) {
                this.counter.innerText = this.iterationsDone.toString();
            }

            this.candidates = [];
            if (this.cells.length === 0) {
                this.toggleGame();
            }
        }
    }

    private removeDead() {
        const alive = this.cells.filter(q => !q.toDie);
        let index = this.cells.findIndex(q => q.toDie);
        while (index >= 0) {
            let dead = this.cells.splice(index, 1);
            dead[0].body.remove();
            delete dead[0];
            index = this.cells.findIndex(q => q.toDie);
        }

        return alive;
    }

    private toggleGame() {
        if (this.isRunning) {
            this.two.unbind('update');
            this.button.innerText = 'Start';
            this.isRunning = false;
            return;
        }
        this.two.bind('update', this.runMainLoop.bind(this));
        this.button.innerText = 'Pause';
        this.isRunning = true;
    }

    private turnCandidates(): Cell[] {
        return this.candidates
            .filter(q => q.aliveNear === 3)
            .map(candidate => new Cell(this.two, candidate.position, Consts.CELL_EDGE_SIZE, Consts.CELL_COLOR_ANGLE, Consts.COLOR_CHANGE_SPEED));
    }

    private createGrid() {
        const bg = this.two.makeRectangle(0, 0, this.two.width, this.two.height);
        bg.fill = Consts.BACKGROUD_COLOR;
        bg.origin = new Vector(-1 * this.two.width / 2, -1 * this.two.height / 2);

        let gridX = 0;
        while (gridX < this.two.width) {
            let line = this.two.makeLine(gridX, 0, gridX, this.two.height);
            line.stroke = Consts.LINES_COLOR;
            gridX += Consts.CELL_EDGE_SIZE;
        }

        let gridY = 0;
        while (gridY < this.two.width) {
            let line = this.two.makeLine(0, gridY, this.two.width, gridY);
            line.stroke = Consts.LINES_COLOR
            gridY += Consts.CELL_EDGE_SIZE;
        }
    }
}

export {
    Program
}