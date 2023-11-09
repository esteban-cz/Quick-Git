import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("btnPressed.Commit&Push", () => {
      //Commit message
      const commitMessage = "new";

      // Open the terminal
      const terminal = vscode.window.createTerminal("Quick Git Terminal");

      // Git Add, Commit, Push
      terminal.sendText(
        `git add . ; git commit -m "${commitMessage}" ; git push`
      );

      // Dispose the terminal
      setTimeout(() => {
        terminal.dispose();
      }, 4000);
    })
  );
}

export function deactivate() {}
