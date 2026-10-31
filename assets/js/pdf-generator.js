function getPrintPageUrl() {
  // Read the GitHub Pages project path from the theme stylesheet URL.
  // This works for both user sites (/) and project sites (/my-cv/).
  const stylesheet = document.getElementById("theme-style");
  const stylesheetHref = stylesheet?.getAttribute("href");

  if (!stylesheetHref) {
    throw new Error("Unable to determine the site's base path.");
  }

  const stylesheetPath = new URL(stylesheetHref, window.location.origin).pathname;
  const basePath = stylesheetPath
    .replace(/\\/assets\\/css\\/main\\.css$/, "")
    .replace(/\\/$/, "");

  return new URL(`${basePath}/print`, window.location.origin);
}

function print() {
  let printURL;

  try {
    printURL = getPrintPageUrl();
  } catch (error) {
    console.error("Unable to open the print page:", error);
    return;
  }

  const printWindow = window.open(printURL.href, "_blank");

  if (!printWindow) {
    console.error("The print window was blocked by the browser.");
    return;
  }

  printWindow.addEventListener(
    "load",
    function () {
      printWindow.focus();
      printWindow.print();
    },
    { once: true }
  );

  printWindow.addEventListener(
    "afterprint",
    function () {
      printWindow.close();
    },
    { once: true }
  );
}

function generatePDF() {
  let printURL;

  try {
    printURL = getPrintPageUrl();
  } catch (error) {
    console.error("Unable to determine the print page URL:", error);
    return;
  }

  fetch(printURL.href)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load print layout: HTTP ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      const container = document.createElement("div");
      container.innerHTML = html;

      const name =
        document.querySelector(".name")?.textContent?.trim() || "Resume";
      const filename = `${name.replace(/\\s+/g, "_")}_Resume.pdf`;

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
