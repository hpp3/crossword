function getClues(selector) {
    try {
        return document.querySelector(selector).value.split("\n").map(x=>x.trim().match(/(\d+) ?[.:-\s]\s*(.+)/)).filter(x=>x).map(x=>x.slice(1).join(". "));
    } catch (err) {
        console.error(err);
        return [];
    }
}

window.onload = function() {
    document.querySelector("#paste").addEventListener("paste", function(event) {
        event.preventDefault();
        let bodyData = event.clipboardData.getData("text/html");
        let sheet = new DOMParser().parseFromString(bodyData, "text/html");
        if (!sheet.body.firstElementChild || sheet.body.firstElementChild.tagName != "GOOGLE-SHEETS-HTML-ORIGIN") {
            alert("This does not look like it was copied from Google Sheets!");
            return;
        }
        document.querySelector("#sheets").innerHTML = DOMPurify.sanitize(bodyData);
        let black = Array.from(sheet.querySelectorAll("tr"), tr => Array.from(tr.querySelectorAll("td"), td => (td.style.backgroundColor == "rgb(0, 0, 0)") ? "." : " ")).flat();
        let text = Array.from(sheet.querySelectorAll("tr"), tr => Array.from(tr.querySelectorAll("td"), td => td.innerText));

        var json = {
            author: document.querySelector("#author").value || "sheet2puz",
            title: document.querySelector("#title").value || "ConvertedPuzzle",
            size: {cols: text[0].length, rows: text.length},
            grid: black,
            clues: {
                across: getClues("#across"),
                down: getClues("#down")
            }
        };
        let puzWriter = new PuzWriter();

        var saveData = (function () {
            var a = document.createElement("a");
            a.style = "display: none";
            return function (data, fileName) {
                var blob = new Blob([data], {type: "octet/stream"}),
                    url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            };
        }());

        saveData(puzWriter.toPuz(json), "puzzle.puz");
    });
};
