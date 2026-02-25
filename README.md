# Document Hub UI (Angular)

Minimal Angular scaffold for the Document Hub UI.

Commands:

```powershell
# install dependencies (run again after editing package.json)
npm install

# serve development server
npx ng serve --open

# build production bundle
npm run build
```

Configure MSAL and Document Hub endpoint in `src/environments/environment.ts`.

The UI supports browsing existing documents, searching by text, and uploading new
files. The upload form includes two dropdowns for **Project** and **Category**;
these values are fetched from the hub API endpoints `/projects` and `/categories`.

If you upgrade Angular or any dependencies, rerun `npm install`. The project uses
Angular 16 and the latest `@azure/msal-angular`/`msal-browser` packages.

For direct uploads we use Azure Data Lake Storage Gen2 (ADLS). The
`environment.storage` section should be populated with your account name,
filesystem (container) and a SAS token that grants write access to the
`alaska-document-hub` container. Example:

```ts
storage: {
  enabled: true,
  accountName: 'AIDS',
  containerName: 'alaska-document-hub',
  sasToken: '<your SAS token starting with ?sv=...>'
}
```

When storage is enabled, the app bypasses the hub API and writes files
straight to `https://<account>.dfs.core.windows.net/<container>/<project>/<category>/<filename>`.
Only the upload path and container are configured; metadata is added in the
path hierarchy. The `@azure/storage-file-datalake` package is used for the
upload from the browser.

