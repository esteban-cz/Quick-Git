import * as vscode from "vscode";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function executeGitCommand(command: string) {
  const terminal = vscode.window.createTerminal("Quick Git Terminal");
  terminal.sendText(command);
  return terminal;
}

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.btnPull", async () => {
      vscode.window.showInformationMessage("Pull command executed.");
      const terminal = executeGitCommand("git pull");
      await delay(10000);
      terminal.dispose();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.btnCommit&Push", async () => {
      vscode.window.showInformationMessage("Commit and Push command executed.");
      const commitMessage =
        vscode.workspace.getConfiguration().get("quickGit.commitMessage") ||
        "new";
      const terminal = executeGitCommand(
        `git add . ; git commit -m "${commitMessage}" ; git push`
      );
      await delay(10000);
      terminal.dispose();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.pull", async () => {
      vscode.window.showInformationMessage("Pull command executed.");
      const terminal = executeGitCommand("git pull");
      await delay(10000);
      terminal.dispose();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.push", async () => {
      vscode.window.showInformationMessage("Push command executed.");
      const terminal = executeGitCommand("git push");
      await delay(10000);
      terminal.dispose();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.commit", async () => {
      vscode.window.showInformationMessage("Commit command executed.");
      const commitMessage =
        vscode.workspace
          .getConfiguration()
          .get("quickGit.commitMessage") || "new";
      const terminal = executeGitCommand(`git add . ; git commit -m "${commitMessage}"`);
      await delay(10000);
      terminal.dispose();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.commit&Push", async () => {
      vscode.window.showInformationMessage("Commit and Push command executed.");
      const commitMessage =
        vscode.workspace.getConfiguration().get("quickGit.commitMessage") ||
        "new";
      const terminal = executeGitCommand(
        `git add . ; git commit -m "${commitMessage}" ; git push`
      );
      await delay(10000);
      terminal.dispose();
    })
  );

  const customStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  customStatusBar.text = "$(git-fetch) $(arrow-up) $(check) $(git-commit)";
  customStatusBar.tooltip = "Git Actions";
  customStatusBar.command = "extension.showGitMenu";
  customStatusBar.show();

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.showGitMenu", async () => {
      const choice = await vscode.window.showQuickPick(
        ["Pull", "Push", "Commit", "Commit and Push"],
        {
          placeHolder: "Select a Git action:",
        }
      );

      switch (choice) {
        case "Pull":
          vscode.commands.executeCommand("extension.pull");
          break;
        case "Push":
          vscode.commands.executeCommand("extension.push");
          break;
        case "Commit":
          vscode.commands.executeCommand("extension.commit");
          break;
        case "Commit and Push":
          vscode.commands.executeCommand("extension.commit&Push");
          break;
        default:
          break;
      }
    })
  );
}

export function deactivate() {}
