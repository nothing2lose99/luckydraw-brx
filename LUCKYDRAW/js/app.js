let isRunning = false;
const resetBtn = document.getElementById("resetBtn");
const winnerName = document.getElementById("winnerName");
const winnerPhone = document.getElementById("winnerPhone");
const pullBtn = document.getElementById("pullBtn");
createSlots();
loadFromStorage();
pullBtn.addEventListener("click", () => {
    if (isRunning) return;
    pullBtn.classList.add("pulling");
    setTimeout(() => pullBtn.classList.remove("pulling"), 600);
    startLuckyDraw();
});
resetBtn.addEventListener("click", () => {
    winnerName.innerText = "Chờ quay...";
    winnerPhone.innerText = "**********";
    resetSlots();
});
function startLuckyDraw() {
    if (isRunning) return;
    isRunning = true;
    winnerName.innerText = "Chờ quay...";
    winnerPhone.innerText = "**********";
    resetSlots();
    startSpin();
    const winner = users[Math.floor(Math.random() * users.length)];
    setTimeout(() => {
        stopSpin(winner.phone, () => {
            winnerName.innerText = winner.name;
            winnerPhone.innerText =
                winner.phone.slice(0, 4)
                + "-"
                + winner.phone.slice(4, 7)
                + "-"
                + winner.phone.slice(7);
            launchConfetti();
            isRunning = false;
        });
    }, 3500);
}
function launchConfetti() {
    if (typeof confetti !== "function") return;
    confetti({
        particleCount: 250,
        spread: 180,
        origin: {
            y: 0.6
        }
    });
}
// ===== CONFIG MODAL =====
const configBtn = document.getElementById("configBtn");
const configModal = document.getElementById("configModal");
const saveConfigBtn = document.getElementById("saveConfigBtn");
const closeConfigBtn = document.getElementById("closeConfigBtn");
const manualInput = document.getElementById("manualInput");
const csvFileInput = document.getElementById("csvFile");
const csvStatus = document.getElementById("csvStatus");
const currentCount = document.getElementById("currentCount");
configBtn.addEventListener("click", openConfig);
closeConfigBtn.addEventListener("click", closeConfig);
saveConfigBtn.addEventListener("click", saveConfig);
configModal.addEventListener("click", e => { if (e.target === configModal) closeConfig(); });
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
        btn.classList.add("active");
        document.getElementById("tab-" + btn.dataset.tab).classList.remove("hidden");
    });
});
csvFileInput.addEventListener("change", handleCSV);
document.getElementById("downloadSampleBtn").addEventListener("click", downloadSampleCSV);
function openConfig() {
    manualInput.value = users.map(u => u.name + " - " + u.phone).join("\n");
    currentCount.innerText = users.length;
    configModal.classList.add("active");
}
function closeConfig() {
    configModal.classList.remove("active");
}
function saveConfig() {
    const parsed = parseManualInput(manualInput.value);
    if (parsed.length === 0) {
        alert("Danh sách trống hoặc sai định dạng!\nVui lòng nhập đúng dạng: Tên - Số điện thoại");
        return;
    }
    users.splice(0, users.length, ...parsed);
    localStorage.setItem("luckyDraw_users", JSON.stringify(users));
    currentCount.innerText = users.length;
    closeConfig();
}
function parseManualInput(text) {
    return text.split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const idx = line.lastIndexOf(" - ");
            if (idx === -1) return null;
            const name = line.slice(0, idx).trim();
            const phone = line.slice(idx + 3).trim();
            return (name && phone) ? { name, phone } : null;
        })
        .filter(Boolean);
}
function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const parsed = parseCSV(ev.target.result);
        if (parsed.length === 0) {
            csvStatus.innerText = "❌ Không tìm thấy dữ liệu hợp lệ trong file CSV.";
            return;
        }
        manualInput.value = parsed.map(u => u.name + " - " + u.phone).join("\n");
        csvStatus.innerText = "✅ Đã tải " + parsed.length + " người từ CSV.";
        currentCount.innerText = parsed.length;
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
        document.querySelector("[data-tab='manual']").classList.add("active");
        document.getElementById("tab-manual").classList.remove("hidden");
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
}
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const result = [];
    lines.forEach((line, i) => {
        if (!line.trim()) return;
        const cols = splitCSVLine(line);
        if (cols.length < 2) return;
        const name = cols[0].replace(/^"|"$/g, "").trim();
        const phone = cols[1].replace(/^"|"$/g, "").trim();
        if (i === 0 && !/\d{6,}/.test(phone.replace(/[\s\-]/g, ""))) return;
        if (name && phone) result.push({ name, phone });
    });
    return result;
}
function splitCSVLine(line) {
    const cols = [];
    let cur = "", inQ = false;
    for (const ch of line) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === "," && !inQ) { cols.push(cur); cur = ""; }
        else { cur += ch; }
    }
    cols.push(cur);
    return cols;
}
function loadFromStorage() {
    const saved = localStorage.getItem("luckyDraw_users");
    if (!saved) return;
    try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
            users.splice(0, users.length, ...parsed);
        }
    } catch (e) { }
}
function downloadSampleCSV() {
    const rows = [
        "H\u1ECD v\u00E0 t\u00EAn,S\u1ED1 \u0111i\u1EC7n tho\u1EA1i",
        "Nguy\u1EC5n V\u0103n A,0908123456",
        "Tr\u1EA7n Th\u1ECB B,0912345678",
        "L\u00EA V\u0103n C,0987654321",
        "Ph\u1EA1m V\u0103n D,0933555777",
        "Nguy\u1EC5n Th\u1ECB E,0909999999"
    ].join("\n");
    const blob = new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "danh_sach_mau.csv";
    a.click();
    URL.revokeObjectURL(url);
}
