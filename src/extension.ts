import * as vscode from "vscode";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("quickGit.btnPressed", async () => {
      const commitMessage =
        vscode.workspace
          .getConfiguration()
          .get("quickGit.commitMessage") || "new";

      const terminal = vscode.window.createTerminal("Quick Git Terminal");

      terminal.sendText(
        `git add . ; git commit -m "${commitMessage}" ; git push`
      );

      await delay(10000);

      terminal.dispose();
    })
  );
}

export function deactivate() {}
