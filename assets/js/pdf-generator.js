function getPrintPageUrl() {
  // Derive the GitHub Pages project path from the theme stylesheet URL.
  const stylesheet = document.getElementById("theme-style");
  const stylesheetHref = stylesheet?.getAttribute("href");

  if (!stylesheetHref) {
    throw new Error("Unable to determine the site's base path.");
  }

  const stylesheetPath = new URL(stylesheetHref, window.location.origin).pathname;
  const stylesheetSuffix = "/assets/css/main.css";

  if (!stylesheetPath.endsWith(stylesheetSuffix)) {
    throw new Error("The theme stylesheet URL has an unexpected path.");
  }

  const basePath = stylesheetPath.slice(0, -stylesheetSuffix.length);
  return new URL(`${basePath}/print`, window.location.origin);
}

function openPrintDialog() {
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
      const parsedDocument = new DOMParser().parseFromString(html, "text/html");
      const sourceWrapper = parsedDocument.querySelector(".wrapper");

      if (!sourceWrapper) {
        throw new Error("The print page does not contain a CV wrapper.");
      }

      // Render the print-page content in the current document so the
      // already-loaded theme stylesheets apply to html2pdf.
      const container = document.createElement("div");
      container.appendChild(sourceWrapper.cloneNode(true));
      Object.assign(container.style, {
        position: "fixed",
        left: "-12000px",
        top: "0",
        width: "1200px",
        background: "#ffffff",
        zIndex: "-1",
      });
      document.body.appendChild(container);

      const name =
        document.querySelector(".name")?.textContent?.trim() || "Resume";
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
          backgroundColor: "#ffffff",
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

      return html2pdf()
        .set(opt)
        .from(container.firstElementChild)
        .save()
        .finally(() => container.remove());
    })
    .catch((err) => console.error("Error generating PDF:", err));
}
