# fgit

fgit is a command-line tool that wraps around Git and provides a simpler way to create conventional commits and other niceties. Conventional commits follow a standardized format for commit messages, making it easier to understand the purpose of a change.

## Background

Conventional commits were created to improve communication and collaboration between developers working on a project. The format consists of a type, scope, and description, with optional footer information such as issue numbers or breaking changes. The standardized format helps to ensure that commit messages are clear and easy to understand, making it easier to track changes and troubleshoot issues.

## Install

### Building the Binary

To use fgit, you need to build the binary first. Here's how to do it:

- Install Rust by following the instructions on the [official website](https://www.rust-lang.org/tools/install).
- Clone this repo onto your computer
- Build the binary by running `cargo build --release`. The binary will be placed in the target/release directory.

### Assigning the Binary to an Executable

- Ensure you have built the binary first using the steps above
- To make the binary executable directly like "fgit", you need to add it to your system's PATH environment variable. Here are the steps for different platforms:

#### Linux/WSL

- Open a terminal window and navigate to your project directory.
- Run the following command to add the binary to your PATH:

```bash
export PATH="$PATH:/path/to/my-project/target/release"
# Replace /path/to/my-project with the path to your project directory.
# You can get this information by running the command pwd from the project directory.
```

- To make this change permanent, you can add this command to your shell's configuration file (e.g. ~/.bashrc for Bash or ~/.zshrc for Zsh).
- After completing these steps, you should be able to run your binary by typing fgit in a terminal window.

## Usage

Here are some examples of how to use fgit:

```bash
$ fgit commit feat user Add login form # git commit -m 'feat(user): Add login form'
$ fgit commit chore deps 'Update to latest' # git commit -m 'chore(deps): Update to latest'
```

It also can pull out ticket numbers from branch information if your branch name is formatted like `issue/ABC-123` or `issue/ABC-1-extra-info`.

```bash
# current branch: issue/ABC-123
$ fgit commit feat user Add login form # git commit -m 'feat(user): Add login form [ABC-123]'
$ fgit commit chore deps 'Update to latest' # git commit -m 'chore(deps): Update to latest [ABC-123]'
```

If installed using the instructions above, you can also update fgit by running:

```bash
$ fgit update
```
