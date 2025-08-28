# Contributing to Pref Editor

Thank you for your interest in contributing to Pref Editor! We welcome contributions from the community.

## Quick Start

1. **Read the development guide**: Check [DEV.md](./DEV.md) for detailed setup instructions
2. **Fork and clone** the repository
3. **Create a feature branch** from `main`
4. **Make your changes** following our guidelines
5. **Run verification**: `npm run verify`
6. **Submit a pull request**

## Pull Request Requirements

### PR Title Format

Your PR title **must** start with one of these prefixes:

-   `feat:` - New features (minor version bump)
-   `fix:` - Bug fixes (patch version bump)
-   `BREAKING:` - Breaking changes (major version bump)

**Examples:**

-   `feat: add preference validation for boolean types`
-   `fix: resolve connection timeout in watchPreference`
-   `BREAKING: remove deprecated createMatcher function`

### Before Submitting

-   [ ] PR title follows the required format
-   [ ] Code follows project conventions
-   [ ] Tests added for new functionality
-   [ ] All tests pass (`npm test`)
-   [ ] Coverage threshold maintained (≥80%)
-   [ ] Verification passes (`npm run verify`)
-   [ ] Documentation updated if needed

## Development Guidelines

### Code Style

-   Use **TypeScript** for all source code
-   Follow existing code patterns and conventions
-   Use **EditorConfig** settings (see `.editorconfig`)
-   Run `npm run lint` to check for style issues

### Testing

-   Add tests for new functionality in the `test/` directory
-   Maintain or improve code coverage
-   Use Vitest testing framework
-   Mock external dependencies appropriately

### Git Workflow

-   **One contribution per branch**
-   Use descriptive branch names (`feat/preference-validation`, `fix/connection-timeout`)
-   Keep commits focused and atomic
-   Write clear commit messages

## What We Look For

### ✅ Good Contributions

-   Clear, focused changes
-   Comprehensive tests
-   Updated documentation
-   Follows existing patterns
-   Solves real problems

### ❌ Avoid These

-   Changing version numbers (automated)
-   Committing generated files (unless already in repo)
-   Creating unnecessary top-level files
-   Breaking existing functionality
-   Poor test coverage

## Getting Help

-   **Development Setup**: See [DEV.md](./DEV.md)
-   **Questions**: Open a GitHub issue
-   **Bugs**: Report via GitHub issues
-   **Feature Requests**: Discuss in GitHub issues first

## Code Review Process

1. **Automated Checks**: CI will run tests, linting, and coverage
2. **Manual Review**: Maintainers will review code quality and design
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged
5. **Release**: Automated versioning and release process

## Types of Contributions

### 🐛 Bug Fixes

-   Fix existing functionality
-   Add regression tests
-   Update documentation if needed

### ✨ New Features

-   Add new functionality
-   Include comprehensive tests
-   Update documentation and examples

### 📚 Documentation

-   Improve existing docs
-   Add examples and guides
-   Fix typos and clarity issues

### 🔧 Refactoring

-   Improve code structure
-   Maintain existing functionality
-   Ensure tests still pass

## License Agreement

By contributing your code, you agree to license your contribution under the [Apache 2.0 License](LICENSE).

## Recognition

Contributors are recognized in our release notes and GitHub contributors list. Thank you for helping make Pref Editor better!

---

**Need help getting started?** Check out issues labeled [`good first issue`](https://github.com/charlesmuchene/pref-editor-js/labels/good%20first%20issue) for beginner-friendly contributions.
