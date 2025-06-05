# BookAI App

This repository contains a simple landing page for BookAI App. Open `index.html` in your browser to see the site.

## iOS Universal Links

To enable Universal Links for the BookAI app, host an `apple-app-site-association` file at `https://bookaiapp.com/.well-known/apple-app-site-association`.
The file must be served over HTTPS with the `application/json` MIME type and **no** `.json` extension or HTTP redirects.
The file content is stored in the `.well-known/` directory of this repository for GitHub Pages hosting.
