<div align="center">
<table>
<tbody>
<td align="center">
<br>
<sub>
  
  [![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)&nbsp;&nbsp;&nbsp;
  ![Extension Version](https://img.shields.io/github/package-json/v/esteban-cz/Quick-Git/master?style=for-the-badge&label=Version)&nbsp;&nbsp;&nbsp;
  ![GitHub last commit](https://img.shields.io/github/last-commit/esteban-cz/Quick-Git?style=for-the-badge)
  
</sub><br>
</td>
</tbody>
</table>
</div>

<br>

# Quick Git

Clone, pull, push, and commit using VS Code’s built-in Git integration. Open **Quick Git** in the status bar or search for **Quick Git** in the Command Palette. **Pull** and **Commit & Push** also appear in the editor toolbar when a repository is open.

When multiple repositories are open, choose the target by its branch and path. Quick Git lists the active editor’s repository first. The **Clone Repository** shortcut is available from an empty window.

**Commit & Push** waits for Git to create a commit before pushing. If the push fails, Quick Git reports that the commit exists locally and offers to open Git Output. [VS Code source control](https://code.visualstudio.com/docs/sourcecontrol/overview)

## Settings

| Setting | Values |
| --- | --- |
| `quickGit.commitScope` | `all` stages and commits all changes in the selected repository. Use `staged` to commit only changes you staged in Source Control. |
| `quickGit.commitMessageOption` | `Default` uses the saved message. `Custom` prompts for a message each time. |
| `quickGit.defaultCommitMessage` | The saved message, initially `New`. |

Quick Git requires VS Code 1.96 or later, the built-in Git extension, and a Git installation.

## Release Notes

### 3.1.0

- Added repository selection, staged-only commits, and Command Palette entries for all Git actions.
- Uses VS Code’s Git integration for cloning and repository operations.
- Fixed the commit message settings and reports operation results after Git finishes.

### 1.0.0

Initial release of "quick-git"

### 1.0.1

Added config, you can now change default commit message :)

### 1.0.2

Fixed timing on closing the terminal too soon ;)

### 2.0.0

Added Pull, Push, Commit and Commit & Push buttons, main Pull and Commit & Push btns are in the top right and the rest are in the bottom left in the status bar.

### 2.0.1

Small changes and fixes.

### 3.0.0

Big changes, added custom commit message, fixed status bar icon not appearing on load, new extension settings, again fixed timings and made custom logo for Quick Git.

### 3.0.1

Added git clone to the Git Actions menu in the status bar, you can customize the directory the repo will clone to and more features coming soon...

### 3.0.2

Updated Git clone action, now if you do not have any folder opened you have in the bottom left corner the option to clone git repo, after any folder/file is opened this will change to Git actions

### 3.0.3

Just updated CHANGELOG.md to be more detailed (added commits and dates to all version updates)

### 3.0.4

Just updated README.md to be more detailed and to have all the features.

### 3.0.5

Optimization updates after a year of not maintaining it.


### 3.0.6

Bug fixes after the update :)

---

**Enjoy!**
