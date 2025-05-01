---
title: This Project Documentation
description: Guidelines for creating the votura project documentation.
tags:
  - Documentation
hide_table_of_contents: false
# sidebar_position: 1
draft: false
---

We are using [Docusaurus](https://docusaurus.io/) for our documentation.
The documentation is hosted on [GitHub Pages](https://pages.github.com/) and is public available [here](https://se-uulm.github.io/votura/).
Every push or pull request to the `main` or `develop` branch of the `votura` repository will trigger a GitHub Action that builds the documentation and deploys it to GitHub Pages.

## Update the documentation

You have already found the documentation, and you can familiarize yourself with the structure and the content.
You can find the source code in the `apps/docs` folder of the `votura` repository.

If you have made changes to the documentation, you can preview them locally before pushing them to the repository.
Therefore, you need to install the dependencies and start the development server:

```bash
$ cd apps/docs
$ npm run start
```

This will start a local server on `http://localhost:3000` where you can preview your changes.

If you want to create a new page, please use the template file `apps/docs/docs/_templatePage.md` as a starting point.

## Include PlantUML or DrawIO diagrams

You visualize your documentation with diagrams you can use [PlantUML](https://plantuml.com/) or [DrawIO](https://app.diagrams.net/).

### PlantUML

To include PlantUML diagrams in your documentation, you need to save your PlantUML source file `myFile.puml` in the `apps/docs/static/uml/` folder.
The GitHub Action will automatically convert the PlantUML source file to an SVG image.
This SVG file you can include in your documentation with the following syntax:

```markdown
![My Diagram](./../relativ/to/uml/myFile.svg)
```

So please do not commit the generated SVG files to the repository.
You don't have to worry about that, because the GitHub Action will take care of that.

### DrawIO

To include DrawIO diagrams in your documentation, you need to save your DrawIO source file `myFile.drawio` in the `apps/docs/static/drawio/` folder.
The GitHub Action will automatically convert the DrawIO source file to an SVG image.
This SVG file you can include in your documentation with the following syntax:

```markdown
![My Diagram](./../relativ/to/drawio/myFile.svg)
```

So please do not commit the generated SVG files to the repository.
You don't have to worry about that, because the GitHub Action will take care of that.

## Versions

For every new votura version release, we create also a new version of the documentation.
Therefore, the responsible person for the release runs the following command:

```bash
$ npm run docusaurus docs:version <version>
```

This will create a new version of the documentation in the `versioned_docs` folder.
See the [Docusaurus documentation](https://docusaurus.io/docs/versioning) for more information.
