import Two from "two.js";
import { Cell } from "./src/cell";
import { Candidate } from "./src/candidate";
import { createGrid } from "./src/grid";

// maybe all CONSTS_TO_UPPERCASE ?
const backgroundColor = '#111';
const linesColor = '#222';
const cellColorAngle = 240;
const colorChangeSpeed = 15;
const cellEdgeSize = 20;

// Maybe put it in an object or structure
let isRunning = false;
let iterationsDone = 0;
let counter: HTMLElement | null;
let button: HTMLElement | null;

const two = new Two({
    fullscreen: true,
    autostart: true
}).appendTo(document.body);

createGrid(two, backgroundColor, linesColor, cellEdgeSize);

window.onload = function () {
    window.addEventListener('click', (e) => {
        console.log('hit', e);
        const x = Math.round(e.clientX / cellEdgeSize);
        const y = Math.round(e.clientY / cellEdgeSize);
        console.log(x, y);
        cells.push(new Cell(two, x, y, cellEdgeSize, cellColorAngle, colorChangeSpeed));
    });

    button = document.querySelector('.panel__button');
    button?.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        toggleGame();
    });

    counter = document.querySelector('.panel__counter');
}

function toggleGame() {
    isRunning = !isRunning;
    if (button) {
        button.innerText = isRunning ? 'Pause' : 'Start';
    }
}

let candidates: Candidate[] = [];
let cells: Cell[] = [];
let timerElapsed = 0;

two.bind('update', function () {
    if (!isRunning) {
        return;
    }

    timerElapsed += two.timeDelta;
    if (timerElapsed >= 100) {
        cells.forEach(cell => cell.check(cells, candidates));
        const newCells = turnCandidates(candidates);
        cells = removeDead(cells);
        cells = joinCells(cells, newCells);

        timerElapsed = 0;
        iterationsDone++;
        if (counter) {
            counter.innerText = iterationsDone.toString();
        }
        console.dir(cells);
        console.dir(candidates);

        candidates = [];
        if (cells.length === 0) {
            toggleGame();
        }
    }

});

function turnCandidates(candidates: Candidate[]): Cell[] {
    return candidates.filter(q => q.aliveNear === 3).map(candidate => new Cell(two, candidate.x, candidate.y, cellEdgeSize, cellColorAngle, colorChangeSpeed));
}

function joinCells(a: Cell[], b: Cell[]) {
    return [...a, ...b];
}

function removeDead(cells: Cell[]) {
    const alive = cells.filter(q => !q.toDie);
    let index = cells.findIndex(q => q.toDie);
    while (index >= 0) {
        let dead = cells.splice(index, 1);
        dead[0].body.remove();
        delete dead[0];
        index = cells.findIndex(q => q.toDie);
    }

    return alive;
}