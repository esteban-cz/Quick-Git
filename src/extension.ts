import * as vscode from "vscode";

interface GitRepository {
  readonly rootUri: vscode.Uri;
  readonly state: {
    readonly HEAD?: { readonly name?: string; readonly commit?: string };
    readonly indexChanges: readonly unknown[];
    readonly mergeChanges: readonly unknown[];
    readonly rebaseCommit?: unknown;
  };
  status(): Promise<void>;
  commit(message: string, options: { all: boolean }): Promise<void>;
  pull(): Promise<void>;
  push(): Promise<void>;
}

interface GitApi {
  readonly repositories: readonly GitRepository[];
  getRepository(uri: vscode.Uri): GitRepository | null;
}

interface GitExtension {
  readonly enabled: boolean;
  getAPI(version: 1): GitApi;
}

const menuItems = [
  { label: "Clone Repository", command: "quickGit.Clone" },
  { label: "Pull", command: "quickGit.Pull" },
  { label: "Push", command: "quickGit.Push" },
  { label: "Commit", command: "quickGit.Commit" },
  { label: "Commit & Push", command: "quickGit.Commit&Push" },
];

type Action = "Pull" | "Push" | "Commit" | "Commit & Push";

function repositoryName(repository: GitRepository): string {
  const path = repository.rootUri.path;
  return path.split("/").filter(Boolean).at(-1) ?? path;
}

async function getGitApi(): Promise<GitApi | undefined> {
  const extension = vscode.extensions.getExtension<GitExtension>("vscode.git");
  const git = extension && (extension.isActive ? extension.exports : await extension.activate());
  if (git?.enabled) {
    return git.getAPI(1);
  }

  void vscode.window.showWarningMessage("Quick Git requires VS Code’s built-in Git extension and a Git installation.");
  return undefined;
}

async function chooseRepository(action: Action): Promise<GitRepository | undefined> {
  const git = await getGitApi();
  if (!git) {
    return undefined;
  }

  const repositories = git.repositories;
  if (repositories.length === 0) {
    void vscode.window.showWarningMessage("Open a Git repository in Source Control to use Quick Git.");
    return undefined;
  }
  if (repositories.length === 1) {
    return repositories[0];
  }

  const editorUri = vscode.window.activeTextEditor?.document.uri;
  const activeRoot = editorUri ? git.getRepository(editorUri)?.rootUri.toString() : undefined;
  const items = repositories.map((repository) => {
    const active = repository.rootUri.toString() === activeRoot;
    const branch = repository.state.HEAD?.name;
    return {
      label: repositoryName(repository),
      description: active ? "Active editor" : undefined,
      detail: branch ? `${branch} · ${repository.rootUri.fsPath}` : repository.rootUri.fsPath,
      repository,
      active,
    };
  });
  items.sort((a, b) => Number(b.active) - Number(a.active) || a.label.localeCompare(b.label));

  const selected = await vscode.window.showQuickPick(items, {
    title: `Quick Git · ${action}`,
    placeHolder: "Choose a repository",
    matchOnDetail: true,
  });
  return selected?.repository;
}

async function getCommitMessage(
  configuration: vscode.WorkspaceConfiguration,
  name: string
): Promise<string | undefined> {
  const defaultMessage = configuration.get("defaultCommitMessage", "New");
  if (configuration.get<string>("commitMessageOption", "Default") === "Default" && defaultMessage.trim()) {
    return defaultMessage;
  }

  return vscode.window.showInputBox({
    title: `Commit in ${name}`,
    prompt: "Enter a commit message",
    validateInput: (value) => value.trim() ? undefined : "Enter a commit message.",
  });
}

function reportFailure(message: string): void {
  void vscode.window.showErrorMessage(message, "Show Git Output").then((choice) => {
    if (choice === "Show Git Output") {
      return vscode.commands.executeCommand("git.showOutput");
    }
    return undefined;
  });
}

export function activate(context: vscode.ExtensionContext): void {
  const runningRepositories = new Set<string>();

  async function runAction(action: Action): Promise<void> {
    let repository: GitRepository | undefined;
    try {
      repository = await chooseRepository(action);
    } catch {
      reportFailure("Quick Git could not connect to VS Code’s Git integration.");
      return;
    }
    if (!repository) {
      return;
    }

    const name = repositoryName(repository);
    const key = repository.rootUri.toString();
    if (runningRepositories.has(key)) {
      void vscode.window.showWarningMessage(`Quick Git is already running an action in ${name}.`);
      return;
    }

    runningRepositories.add(key);
    let committed = false;
    try {
      const configuration = vscode.workspace.getConfiguration("quickGit", repository.rootUri);
      const commitAction = action === "Commit" || action === "Commit & Push";
      const stagedOnly = configuration.get<string>("commitScope", "all") === "staged";
      const message = commitAction ? await getCommitMessage(configuration, name) : undefined;
      if (commitAction && !message?.trim()) {
        return;
      }

      const result = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: `Quick Git · ${action} in ${name}` },
        async () => {
          if (message !== undefined) {
            await repository.status();
            if (repository.state.rebaseCommit || repository.state.mergeChanges.length > 0) {
              return "Resolve conflicts or finish the rebase in Source Control before committing.";
            }
            if (stagedOnly && repository.state.indexChanges.length === 0) {
              return "Stage changes in Source Control before committing.";
            }

            const previousCommit = repository.state.HEAD?.commit;
            const previousBranch = repository.state.HEAD?.name;
            await repository.commit(message, { all: !stagedOnly });
            committed = true;

            if (action === "Commit & Push") {
              await repository.status();
              const head = repository.state.HEAD;
              if (!head?.commit || head.commit === previousCommit) {
                return "Git did not report a new commit. Push skipped.";
              }
              if (previousBranch && previousBranch !== head.name) {
                return "The checked-out branch changed during the commit. Push skipped.";
              }
            }
          }

          if (action === "Pull") {
            await repository.pull();
          }
          if (action === "Push" || action === "Commit & Push") {
            await repository.push();
          }
          return undefined;
        }
      );

      if (result) {
        void vscode.window.showWarningMessage(`Quick Git · ${name}: ${result}`);
        return;
      }
      vscode.window.setStatusBarMessage(`Quick Git · ${action} complete in ${name}`, 4000);
    } catch {
      const failedAction = committed && action === "Commit & Push"
        ? `Commit created in ${name}. Push did not complete.`
        : `${action} failed in ${name}.`;
      reportFailure(`Quick Git · ${failedAction}`);
    } finally {
      runningRepositories.delete(key);
    }
  }

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10001);
  const updateStatusBar = () => {
    const hasFolders = Boolean(vscode.workspace.workspaceFolders?.length);
    statusBar.text = hasFolders ? "$(git-commit) Quick Git" : "$(repo-clone) Clone Repository";
    statusBar.tooltip = hasFolders ? "Open Quick Git actions" : "Clone a Git repository";
    statusBar.command = hasFolders ? "quickGit.showGitMenu" : "quickGit.showGitClone";
    statusBar.show();
  };
  const clone = () => vscode.commands.executeCommand("git.clone");

  context.subscriptions.push(
    statusBar,
    vscode.workspace.onDidChangeWorkspaceFolders(updateStatusBar),
    vscode.commands.registerCommand("quickGit.Clone", clone),
    vscode.commands.registerCommand("quickGit.showGitClone", clone),
    vscode.commands.registerCommand("quickGit.Pull", () => runAction("Pull")),
    vscode.commands.registerCommand("quickGit.Push", () => runAction("Push")),
    vscode.commands.registerCommand("quickGit.Commit", () => runAction("Commit")),
    vscode.commands.registerCommand("quickGit.Commit&Push", () => runAction("Commit & Push")),
    vscode.commands.registerCommand("quickGit.showGitMenu", async () => {
      const selected = await vscode.window.showQuickPick(menuItems, {
        title: "Quick Git",
        placeHolder: "Choose a Git action",
      });
      if (selected) {
        await vscode.commands.executeCommand(selected.command);
      }
    })
  );

  updateStatusBar();
}
