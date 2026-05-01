---
title: Cross-cutting feature with one unknown repo code
affects_repos: [recipes-web, ghost-repo]
---

# Unknown repo fixture

`recipes-web` is declared in the paired project.toml, but `ghost-repo` is
not — rule 12 requires the validator to reject it.
