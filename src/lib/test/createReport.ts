import fs from "fs";

export default function createReport() {
  const shotsDir = new URL("../../../shots", import.meta.url);
  const files = fs.readdirSync(shotsDir);
  const sets = files.reduce(
    (acc, file) => {
      const key = file.split(".")[0];
      if (!key) return acc;
      const value = acc[key] || [];
      value.push(file);
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string[]>,
  );
  const panes = Object.entries(sets).map(([key, value]) => {
    const p = key.replaceAll("_", "/");
    return `
            <div class="set" data-path="${p}">
                <div class="header">
                <h1>${p}</h1>
                <p>
                    <a href="https://blog.beeminder.com${p}">base</a> |
                    <a href="http://localhost:4321${p}">compare</a>
                </p>
                </div>
                <div class="shots">
                ${value
                  .map(
                    (file) =>
                      `<a class="shot" href="./shots/${file}"><img src="./shots/${file}" /></a>`,
                  )
                  .join("\n")}
                  </div>
            </div>
        `;
  });

  const html = `
        <html>
        <head>
        <style>
        h1 {
            margin-bottom: 0;
        }
        p {
            margin-top: 0;
        }
        .shots {
            display: flex;
            justify-content: space-between;
        }
        .shot {
            display: block;
            flex: 0 0 30%;
            max-height: calc(100vh - 100px);
        }
        img {
            min-width: 0;
            max-width: 100%;
            height: 100%;
            object-fit: contain;
        }
        </style>
        </head>
            <body>
                ${panes.join("\n")}
            </body>
        </html>
    `;

  // const reportPath = path.join(shotsDir.pathname, "..", "report.html");
  const reportPath = new URL("../report.html", shotsDir);

  fs.writeFileSync(reportPath, html);

  console.log(`Report written to ${reportPath}`);
}
