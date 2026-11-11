# WIPS website

The website for **Women in Protective Services (WIPS)**: a global movement for women working in, entering or aspiring to careers across protective and public safety services.

It is a plain static site (HTML, CSS and a small JavaScript file). There is no build step and nothing to install.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About WIPS |
| `our-people.html` | Our people (founder and Steering Group) |
| `what-we-do.html` | What we do (programmes and their status) |
| `stories.html` | Stories, including the On the record feature |
| `news-and-events.html` | News and events, newsletter sign-up |
| `get-involved.html` | Get involved (register interest, partnership enquiry, FAQ) |
| `find-specialist-support.html` | Find specialist support |
| `contact.html` | Contact, press information, logo downloads |

Images are in `assets/img/`. The shared script that renders each page is `assets/js/wips-runtime.js`.

## Preview it locally

Open `index.html` in a browser, or run a local server from this folder:

```
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Publish with GitHub Pages

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, and save.
3. The site appears at the address GitHub shows on that page after a minute or two.

GitHub Pages on a private repository needs a paid GitHub plan. On a free plan, make the repository public first, or host it elsewhere (Netlify and Cloudflare Pages both deploy a folder like this as it is).

To use a custom domain such as `wips.global`, add it under **Settings → Pages → Custom domain** and point the domain's DNS at GitHub.

## Editing content

Each page has two parts:

- the layout and copy, inside `<template id="page-template">`
- a `<script>` at the bottom with the page's data and behaviour

Lists that change often are plain data at the top of each page's script. For example:

- **Steering Group on Home:** `GROUP` in `index.html`
- **Steering Group bios:** `PEOPLE` in `our-people.html`
- **Programmes and their status:** `PROGS` in `what-we-do.html`. Change `status`, `stands` and `cta` when a programme opens.
- **News list:** `ITEMS` in `news-and-events.html`
- **On the record facts and sources:** `RECORD` in `stories.html`

In the layout, `{{ name }}` inserts a value from the script, `<sc-for>` repeats a block for each item in a list, and `<sc-if>` shows a block only when a value is true.

## Brand

- **Colours:** Vibrant Blue `#090088`, Yellow `#FBE42A`, Electric Blue `#02006C`, white, and Cream `#F6F1E6` for reading sections. Yellow is for buttons, labels and highlights only.
- **Type:** Fraunces for headings, Figtree for body text, both loaded from Google Fonts.
- **Logos:** the blue mark in the header, the yellow reversed logo in the footer.

## Before launch

The forms show the journey but **do not send anything yet**. Each one needs connecting to a real destination (for example a form service or mailing list) and testing.

Still needed:

- Contact and media email addresses.
- Operator or registration details for the footer.
- Privacy, safeguarding and accessibility pages.
- Agreed wording on the IPSA relationship, and Satia's public title.
- Bios and photos for Dr Ceese Kaur Seera and Professor Alison Wakefield; a bio for Hamna Ismail.
- Verified Facebook, TikTok and X links.
- Real photography with permissions. `hero-placeholder.jpg` and `hands-placeholder.jpg` are placeholders, and the About event photo needs permission and a credit.
- Specialist review of the support page.
