import * as vscode from "vscode";

let StatusBar: vscode.StatusBarItem;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function executeGitCommand(command: string) {
  const terminal = vscode.window.createTerminal("Quick Git Terminal");
  terminal.sendText(command);
  return terminal;
}

function updateStatusBarItem(): void {
	StatusBar.text = "$(git-fetch) $(arrow-up) $(check) $(git-commit)";
	StatusBar.tooltip = "Git Actions";
  StatusBar.show();
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.Pull", async () => {
      try {
        vscode.window.showInformationMessage(`Pull command executed.`, "Ok");
        const terminal = executeGitCommand("git pull");
        await delay(20000);
        terminal.dispose();
      } catch (error) {
        vscode.window.showErrorMessage(`Error occurred while executing Pull command: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.Commit&Push", async () => {
      const commitMessageOption = vscode.workspace
        .getConfiguration()
        .get("quickGit.commitMessageOption", "Default");

      let commitMessage = "";

      if (commitMessageOption === "Default") {
        commitMessage =
          vscode.workspace
            .getConfiguration()
            .get("quickGit.defaultCommitMessage") || "New";
      } else {
        const input = await vscode.window.showInputBox({
          placeHolder: "Enter custom commit message",
          prompt: "Custom commit message",
        });
        if (input) {
          commitMessage = input;
        } else {
          return;
        }
      }
      try {
        vscode.window.showInformationMessage(
          `Commit and Push command executed with the message ${commitMessage}.`,
          "Ok"
        );
        const terminal = executeGitCommand(
          `git add . ; git commit -m "${commitMessage}" ; git push`
        );
        await delay(20000);
        terminal.dispose();
      } catch (error) {
        vscode.window.showErrorMessage(`Error occurred while executing Commit and Push command: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.Push", async () => {
      try {
        vscode.window.showInformationMessage(`Push command executed.`, "Ok");
        const terminal = executeGitCommand("git push");
        await delay(20000);
        terminal.dispose();
      } catch (error) {
        vscode.window.showErrorMessage(`Error occurred while executing Push command: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.Commit", async () => {
      const commitMessageOption = vscode.workspace
        .getConfiguration()
        .get("quickGit.commitMessageOption", "Default");

      let commitMessage = "";

      if (commitMessageOption === "Default") {
        commitMessage =
          vscode.workspace
            .getConfiguration()
            .get("quickGit.defaultCommitMessage") || "New";
      } else {
        const input = await vscode.window.showInputBox({
          placeHolder: "Enter custom commit message",
          prompt: "Custom commit message",
        });
        if (input) {
          commitMessage = input;
        } else {
          return;
        }
      }
      try {
        vscode.window.showInformationMessage(
          `Commit command executed with the message ${commitMessage}.`,
          "Ok"
        );
        const terminal = executeGitCommand(
          `git add . ; git commit -m "${commitMessage}"`
        );
        await delay(20000);
        terminal.dispose();
      } catch (error) {
        vscode.window.showErrorMessage(`Error occurred while executing Commit command: ${error}`);
      }
    })
  );

  StatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10000);
  StatusBar.command = "quickGit.showGitMenu";
  context.subscriptions.push(StatusBar);

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.showGitMenu", async () => {
      const choice = await vscode.window.showQuickPick(
        ["Pull", "Push", "Commit", "Commit and Push"],
        {
          placeHolder: "Select a Git action:",
        }
      );
      switch (choice) {
        case "Pull":
          vscode.commands.executeCommand("quickGit.Pull");
          break;
        case "Push":
          vscode.commands.executeCommand("quickGit.Push");
          break;
        case "Commit":
          vscode.commands.executeCommand("quickGit.Commit");
          break;
        case "Commit and Push":
          vscode.commands.executeCommand("quickGit.Commit&Push");
          break;
        default:
          break;
      }
    })
  );
  updateStatusBarItem();
}

export function deactivate() {}