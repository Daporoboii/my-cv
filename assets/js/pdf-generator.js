function print() {
  // Resolve the print page relative to the current GitHub Pages project path.
  const printURL = new URL("print", window.location.href);
  const printWindow = window.open(printURL.href, "_blank");

  if (!printWindow) {
    console.error("The print window was blocked by the browser.");
    return;
  }

  printWindow.addEventListener("load", function () {
    printWindow.focus();
    printWindow.print();
  });

  // Do not close the window on a timer: the print dialog may still be open.
  printWindow.addEventListener("afterprint", function () {
    printWindow.close();
  });
}

function generatePDF() {
  // Get the print layout URL relative to the GitHub Pages project path.
  const printURL = new URL("print", window.location.href);

  fetch(printURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load print layout: HTTP ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      const container = document.createElement("div");
      container.innerHTML = html;

      const name = document.querySelector(".name")?.textContent?.trim() || "Resume";
      const filename = `${name.replace(/\s+/g, "_")}_Resume.pdf`;

      const opt = {
        margin: 8,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          windowWidth: 1200,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css", "legacy"],
        },
      };

      html2pdf()
        .set(opt)
        .from(container)
        .save()
        .catch((err) => console.error("Error generating PDF:", err));
    })
    .catch((err) => console.error("Error fetching print layout:", err));
}
