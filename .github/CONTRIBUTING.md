# Contributing Guide

Thank you for investing your time in contributing to our project!
Please read our Code of Conduct to keep our community approachable and respectable.

## Security Issues

If you discover a security vulnerability within votura, please create a [security advisory](https://github.com/SE-UUlm/votura/security/advisories)

## New Issue

You have spotted any other problem with votura, or you have an idea for a new feature?
Please check if the issue already exists in our [issue tracker](https://github.com/SE-UUlm/votura/issues).
If not, please create a new issue following the relevant issue form.
Please provide as much information as possible to help us understand the problem or feature request.

The issue is the place to discuss the problem, feature request and possible solutions.

Issues should be linked to an epic.
This is done by adding the Epic issue as a parent issue and adding the relevant epic label.

Generally speaking, Issues for new Features should follow [this workflow diagram](https://github.com/SE-UUlm/votura/blob/develop/apps/docs/static/drawio/epicFlow.svg).

If a Feature is relevant to the frontend, the first issue should be a Penpot Design issue and its name should start with "[PP] ...".  
Similarly, if a Feature is relevant to the backend, the first issue should be a Design issue for the database and its name should start with "[DB] ...".  
For smaller changes, the design issue and the implementation issue can be the same.
In such a case, the issue name should start with the last relevant epic e.g. if a new backend API needs to be designed and implemented, the issue name should start with "[BAPI] ...".  
Still, all relevant labels should be added to the issue, so in the previous example, both the "BAPI" and "OAP" label should be added, if the API Endpoint is not designed yet.

## New Pull Request

- To keep track of all changes, every pull request (PR) must be linked to an issue.
- Discussions about the evaluation of the software technical implementation are held on the pull request. Discussions on the actual problem or the requirements are held on the issue.
- Please provide as much information as possible to help us understand the changes you made and follow the pull request template.
- As long as a pull request is being worked on, it must be marked as a Draft.
- When an issue has been implemented and tested, move the issue **and** the pull request from "Under Development" to "To Review". Follow the pr template, and please remove the Draft status.
- If you want to review a pull request, move the issue **and** the pull request from "To Review" to "In Review". At the same time, you add yourself as a Reviewer to the pull request.
- The reviewer who opens a thread in the pull request is responsible for marking the thread as resolved.
- If the pull request is approved and merged, you move the pull request **and** issue from "In Review" to "Finished" and close the issue.
- The last person who approves the pull request is responsible for merging it.
- Every developer is required to check pull requests and issues with the status "To Review", regardless of whether they are requested to check them or not.
- Squash commits is disabled (to keep git blame if a different person merges the request)

### Branching conventions

- `main` branch
  The `main` branch is protected. Pushing to it is not permitted; it can only be done via a merge request.
  - Only the `develop` branch may be merged into the `main` branch.
  - Merging into the `main` branch needs 3 approvals (authors/committers can not approve).
  - The software versions are marked with tags on the `main` branch.
  - Only signed commits are allowed.
  - The `main` branch is the default branch.
- `develop` branch
  - The `develop` branch is protected. Pushing to the `develop` branch is not allowed; this can only happen via a merge request.
  - Merging into the `develop` branch needs 1 approval (authors/committers can not approve).
  - Only signed commits are allowed.
- feature branch
  - The feature branch must always correspond to an open issue.
  - The feature branch is named as follows: `<Issue ID>-<Issue title>` e.g. `42-prevent-racing-of-requests`
  - Only signed commits are allowed.

Regex: `^main$|^develop$|\d+(-\w+)+$`

### Commit message convention

Every commit message has to follow the following pattern:

Regex: `^#\d+: .{5,}$|^Merge pull request #\d+.*$|^Merge branch .*$|^Merge remote-tracking branch .*$`

```txt
#<Issue ID>: <description>

[optional body]

[optional footer(s)]
```

See also [www.conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/#specification).

Example commit message with multi-paragraph body:

```txt
#42: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.
```
