import * as vscode from "vscode";
import * as fs from "fs";

let StatusBar: vscode.StatusBarItem;
let StatusBarClone: vscode.StatusBarItem;
let terminal: vscode.Terminal | null = null;

function executeGitCommand(command: string) {
  if (!terminal) {
    terminal = vscode.window.createTerminal("Quick-Git");
  }

  // terminal.show();
  
  terminal.sendText(command);
}

function updateStatusBarItem(): void {
  StatusBar.text = `$(git-pull-request) $(git-fetch) $(arrow-up) $(check) $(git-commit)`;
  StatusBar.tooltip = "Git Actions";
  StatusBar.show();
}

function updateStatusBarClone(): void {
  StatusBarClone.text = `$(git-pull-request) Clone git`;
  StatusBarClone.tooltip = "Git Clone";
  StatusBarClone.show();
}

function updateStatusBars() {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
    updateStatusBarClone();
    StatusBar.hide();
  } else {
    StatusBarClone.hide();
    updateStatusBarItem();
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.Clone", async () => {
      try {
        const repoUrl = await vscode.window.showInputBox({
          placeHolder: "Enter git repo URL:",
          prompt: "Git repo URL",
        });
        
        if (!repoUrl) {return;}
  
        const selectedFolder = await vscode.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          openLabel: "Clone here",
        });
  
        if (!selectedFolder || selectedFolder.length === 0) {return;}
  
        const cloneDestination = selectedFolder[0].fsPath;
  
        if (fs.existsSync(`${cloneDestination}/.git`)) {
          vscode.window.showErrorMessage(`A Git repository already exists in ${cloneDestination}.`);
          return;
        }

        vscode.window.showInformationMessage(`Cloning repository from ${repoUrl} to ${cloneDestination}`, "Ok");
  
        executeGitCommand(`cd "${cloneDestination}" ; git clone ${repoUrl}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Error while cloning: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.Pull", async () => {
      vscode.window.showInformationMessage(`Pull command executed.`, "Ok");
      executeGitCommand("git pull");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.Push", async () => {
      vscode.window.showInformationMessage(`Push command executed.`, "Ok");
      executeGitCommand("git push");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.Commit", async () => {
      let commitMessage = await vscode.window.showInputBox({
        placeHolder: "Enter commit message",
        prompt: "Custom commit message",
      });
      
      if (!commitMessage || commitMessage.trim() === "") {
        vscode.window.showErrorMessage("Commit message cannot be empty.");
        return;
      }

      vscode.window.showInformationMessage(`Commit executed with message: ${commitMessage}.`, "Ok");
      executeGitCommand(`git add . ; git commit -m "${commitMessage}"`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.Commit&Push", async () => {
      let commitMessage = await vscode.window.showInputBox({
        placeHolder: "Enter commit message",
        prompt: "Custom commit message",
      });
      
      if (!commitMessage || commitMessage.trim() === "") {
        vscode.window.showErrorMessage("Commit message cannot be empty.");
        return;
      }

      vscode.window.showInformationMessage(`Commit & Push executed with message: ${commitMessage}.`, "Ok");
      executeGitCommand(`git add . ; git commit -m "${commitMessage}" ; git push`);
    })
  );

  StatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10001);
  StatusBar.command = "quickGit.showGitMenu";
  context.subscriptions.push(StatusBar);

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.showGitMenu", async () => {
      const choice = await vscode.window.showQuickPick(
        ["Clone", "Pull", "Push", "Commit", "Commit and Push"],
        { placeHolder: "Select a Git action:" }
      );
      if (choice) {
        vscode.commands.executeCommand(`quickGit.${choice.replace(/ /g, "&")}`);
      }
    })
  );

  StatusBarClone = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10000);
  StatusBarClone.command = "quickGit.showGitClone";
  context.subscriptions.push(StatusBarClone);

  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.showGitClone", async () => {
      vscode.commands.executeCommand("quickGit.Clone");
    })
  );

  vscode.workspace.onDidChangeWorkspaceFolders(updateStatusBars);
  updateStatusBars();
}

export function deactivate() {
  if (terminal) {
    terminal.dispose();
  }
}
