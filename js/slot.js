const SLOT_COUNT = 10;
const REEL_COPIES = 6;
const slotReels = [];
const slotTimers = [];
let cellH = 0;
function createSlots() {
    const machine = document.getElementById("slotMachine");
    machine.innerHTML = "";
    slotReels.length = 0;
    for (let i = 0; i < SLOT_COUNT; i++) {
        const slot = document.createElement("div");
        slot.className = "slot";
        const wrap = document.createElement("div");
        wrap.className = "reel-wrap";
        const strip = document.createElement("div");
        strip.className = "reel-strip";
        for (let r = 0; r < REEL_COPIES; r++) {
            for (let n = 0; n < 10; n++) {
                const cell = document.createElement("div");
                cell.className = "reel-cell";
                cell.textContent = n;
                strip.appendChild(cell);
            }
        }
        wrap.appendChild(strip);
        slot.appendChild(wrap);
        machine.appendChild(slot);
        slotReels.push({ strip, offset: 0 });
    }
    requestAnimationFrame(initCells);
}
function initCells() {
    if (!slotReels.length) return;
    const h = slotReels[0].strip.parentElement.offsetHeight;
    if (!h) { requestAnimationFrame(initCells); return; }
    cellH = h;
    document.getElementById("slotMachine").style.setProperty("--cell-h", h + "px");
    slotReels.forEach(r => {
        r.offset = 0;
        r.strip.style.transform = "translateY(0)";
    });
}
function getH() {
    if (slotReels.length && slotReels[0].strip.parentElement) {
        const h = slotReels[0].strip.parentElement.offsetHeight;
        if (h > 0) { cellH = h; return h; }
    }
    return cellH || 80;
}
function startSpin() {
    const h = getH();
    slotReels.forEach((r, i) => {
        cancelAnimationFrame(slotTimers[i]);
        if (!r.offset) r.offset = Math.floor(Math.random() * 10) * h;
        let last = null;
        function frame(ts) {
            if (!last) last = ts;
            const dt = Math.min(ts - last, 50) / 1000;
            last = ts;
            r.offset += h * 18 * dt;
            if (r.offset >= h * 40) r.offset -= h * 30;
            r.strip.style.transform = `translateY(-${r.offset}px)`;
            slotTimers[i] = requestAnimationFrame(frame);
        }
        slotTimers[i] = requestAnimationFrame(frame);
    });
}
function stopSpin(phone, onDone) {
    const h = getH();
    const digits = phone.split("");
    digits.forEach((digit, index) => {
        setTimeout(() => {
            cancelAnimationFrame(slotTimers[index]);
            const r = slotReels[index];
            const d = parseInt(digit);
            const currentCell = Math.floor(r.offset / h);
            let target;
            for (let step = 1; step <= 10; step++) {
                if ((currentCell + step) % 10 === d) {
                    target = (currentCell + step) * h;
                    break;
                }
            }
            if (target === undefined) target = (currentCell + 10) * h;
            r.strip.style.transition = "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            r.strip.style.transform = `translateY(-${target}px)`;
            r.offset = target;
            setTimeout(() => {
                r.strip.style.transition = "";
                r.strip.parentElement.parentElement.classList.add("active");
                if (index === digits.length - 1 && typeof onDone === "function") {
                    onDone();
                }
            }, 420);
        }, index * 300);
    });
}
function resetSlots() {
    slotReels.forEach((r, i) => {
        cancelAnimationFrame(slotTimers[i]);
        r.strip.style.transition = "";
        r.strip.style.transform = "translateY(0)";
        r.offset = 0;
        r.strip.parentElement.parentElement.classList.remove("active");
    });
}

