# Contributing

We are glad to have you contribute to this project.

## How to contribute

1. Fork the repo.
2. Create a feature branch for your contribution out of the `main` branch. Only one contribution per branch is accepted.
3. Implement your contribution while respecting our rules (see below).
4. If possible, add tests under `test/` dir for your contribution to make sure it actually works.
5. Don't forget to run `npm test` just right before submitting. This also checks for code styling issues (these can be ran separately via `npm run lint`)
6. Submit a pull request against our `main` branch!

## Rules

-   **Do** use feature branches.
-   **Do** conform to existing coding style so that your contribution fits in.
-   **Do** use [EditorConfig] to enforce our [whitespace rules](.editorconfig). If your editor is not supported, enforce the settings manually.
-   **Do** run `npm test` for ESLint and unit test coverage.
-   **Do not** touch the `version` field in [package.json](package.json).
-   **Do not** commit any generated files, unless already in the repo. If absolutely necessary, explain why.
-   **Do not** create any top level files or directories. If absolutely necessary, explain why and update [.npmignore](.npmignore).

## License

By contributing your code, you agree to license your contribution under our [LICENSE](LICENSE).

[editorconfig]: http://editorconfig.org/
