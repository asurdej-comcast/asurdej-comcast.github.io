var currentElement = null;
const AXIS_FACTOR = 100;

function getCenter(element) {
    let rect = element.getBoundingClientRect();
    let x = (2 * rect.x + rect.width) / 2;
    let y = (2 * rect.y + rect.height) / 2;
    return {x:x, y:y};
}

function findClosest(current, x, y) {
    if (x*y > 0) {
        console.log("invalid params");
        return null;
    }
    let focusables = document.getElementsByClassName("focusable");
    let minDist = { dist:Number.POSITIVE_INFINITY, elem:null };
    for (let i = 0; i < focusables.length; i++) {
        let center = getCenter(focusables[i]);
        let xdist = current.x - center.x;
        let ydist = current.y - center.y;
        if (x != 0 && xdist*x >= 0) {
            continue;
        }
        if (y != 0 && ydist*y >= 0) {
            continue;
        }
        if (!y) {
            ydist *= AXIS_FACTOR;
        }
        if (!x) {
            xdist *= AXIS_FACTOR;
        }
        let distance =
            Math.sqrt(xdist * xdist + ydist * ydist);
        if (distance === 0) {
            continue;
        }
        if (distance < minDist.dist) {
            minDist.dist = distance;
            minDist.elem = focusables[i];
        }
    }
    return minDist.elem;
}

document.addEventListener("DOMContentLoaded", () => {
    currentElement = document.getElementsByClassName("focused").length > 0
                     ? document.getElementsByClassName("focused")[0]
                     : null;
});

window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
        return;
    }

    switch(event.code) {
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
        if (!currentElement) {
            let focusables = document.getElementsByClassName("focusable");
            currentElement = focusables[0];
            currentElement.classList.add("focused");
            event.preventDefault();
            return;
        }

        let currCenter = getCenter(currentElement);
        let x = 0, y = 0;
        switch (event.code) {
            case "ArrowUp":
                y = -1;
                break;
            case "ArrowDown":
                y = 1;
                break;
            case "ArrowLeft":
                x = -1;
                break;
            case "ArrowRight":
                x = 1
                break;
        }
        let closest = findClosest(currCenter, x, y);

        if (closest) {
            currentElement.classList.remove("focused");
            currentElement = closest;
            currentElement.classList.add("focused");
        }
        break;
    case "Enter":
        currentElement.click();
        break;
    }

}, true);

