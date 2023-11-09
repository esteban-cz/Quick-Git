import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // Register the command
  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.btnPressed", () => {
      // Get the configured commit message
      const commitMessage =
        vscode.workspace
          .getConfiguration()
          .get("quickGit.commitMessage") || "new";

      // Open the terminal
      const terminal = vscode.window.createTerminal("Quick Git Terminal");

      // Git Add, Commit, Push
      terminal.sendText(
        `git add . ; git commit -m "${commitMessage}" ; git push`
      );

      // Dispose the terminal after a delay
      setTimeout(() => {
        terminal.dispose();
      }, 3000);
    })
  );
}

export function deactivate() {}
