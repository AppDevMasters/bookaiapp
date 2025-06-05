# Deploying bookaiapp.com

This folder contains a minimal static website for hosting Universal Links.
You can deploy it with Netlify, Vercel or GitHub Pages.

## Netlify
1. Create a new site from this repository.
2. Netlify will automatically detect the `_redirects` file.
3. Configure the domain `bookaiapp.com` in the site settings.

## Vercel
1. Import the repository on [Vercel](https://vercel.com).
2. Vercel will read `vercel.json` for routing rules.
3. Assign `bookaiapp.com` to the project.

## GitHub Pages
1. Enable Pages in repository settings.
2. Set the branch to deploy from and configure DNS for `bookaiapp.com`.

After deploying, ensure `https://bookaiapp.com/.well-known/apple-app-site-association` returns this folder's AASA file without redirects.
