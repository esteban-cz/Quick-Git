const assert = require("node:assert/strict");
const fs = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../out/extension.js"), "utf8");
const commitAndPush = "quickGit.Commit&Push";

function setup(options = {}) {
  const calls = [];
  const messages = [];
  const commands = new Map();
  const disposable = { dispose() {} };
  const settings = options.settings ?? {};
  const makeRepository = (name) => {
    const path = `/workspace/${name}`;
    const state = {
      HEAD: { name: "main", commit: "before" },
      indexChanges: options.noStagedChanges ? [] : [{}],
      mergeChanges: [],
    };
    return {
      rootUri: { path, fsPath: path, toString: () => path },
      state,
      async status() {},
      async commit(message, { all }) {
        calls.push(["commit", name, message, all]);
        if (options.commitFails) {
          throw new Error("Commit hook rejected the commit");
        }
        if (!options.unchangedHead) {
          state.HEAD.commit = "after";
        }
      },
      async push() {
        calls.push(["push", name]);
        if (options.pushFails) {
          throw new Error("Push failed");
        }
      },
      async pull() { calls.push(["pull", name]); },
    };
  };
  const primary = makeRepository("primary");
  const secondary = makeRepository("secondary");
  const repositories = options.multiple ? [primary, secondary] : [primary];

  const vscode = {
    extensions: {
      getExtension: () => ({
        isActive: true,
        exports: { enabled: true, getAPI: () => ({ repositories, getRepository: () => secondary }) },
      }),
    },
    commands: {
      registerCommand(name, action) { commands.set(name, action); return disposable; },
      executeCommand(name) { return commands.get(name)?.(); },
    },
    window: {
      activeTextEditor: { document: { uri: {} } },
      createStatusBarItem() { return { ...disposable, show() {} }; },
      setStatusBarMessage(text) { messages.push(text); },
      showWarningMessage(text) { messages.push(text); },
      async showErrorMessage(text) { messages.push(text); },
      async showInputBox() { return options.customMessage; },
      async showQuickPick(items, pickerOptions) {
        if (pickerOptions.placeHolder === "Choose a Git action") {
          return items.find((item) => item.label === "Commit & Push");
        }
        assert.equal(pickerOptions.placeHolder, "Choose a repository");
        assert.equal(items[0].label, "secondary");
        return items.find((item) => item.repository === primary);
      },
      withProgress(_, task) { return task(); },
    },
    workspace: {
      workspaceFolders: [{}],
      onDidChangeWorkspaceFolders: () => disposable,
      getConfiguration: (_, resource) => {
        assert.equal(resource, primary.rootUri);
        return { get: (key, fallback) => settings[key] ?? fallback };
      },
    },
    StatusBarAlignment: { Left: 1 },
    ProgressLocation: { Notification: 15 },
  };
  const exports = {};
  vm.runInNewContext(source, { exports, require: () => vscode });
  exports.activate({ subscriptions: [] });
  return { calls, messages, run: (command) => commands.get(command)() };
}

test("the action menu uses the selected repository and existing staged changes", async () => {
  const message = 'Fix "Open & Save"';
  const { calls, run } = setup({
    multiple: true,
    settings: { commitScope: "staged", commitMessageOption: "Custom" },
    customMessage: message,
  });

  await run("quickGit.showGitMenu");
  assert.deepEqual(calls, [["commit", "primary", message, false], ["push", "primary"]]);
});

test("a failed or skipped commit cannot push existing commits", async () => {
  const failed = setup({ commitFails: true });
  await failed.run(commitAndPush);
  assert.deepEqual(failed.calls, [["commit", "primary", "New", true]]);
  assert.match(failed.messages.at(-1), /Commit & Push failed/);

  const unchanged = setup({ unchangedHead: true });
  await unchanged.run(commitAndPush);
  assert.deepEqual(unchanged.calls, [["commit", "primary", "New", true]]);
  assert.match(unchanged.messages.at(-1), /Push skipped/);

  const empty = setup({ noStagedChanges: true, settings: { commitScope: "staged" } });
  await empty.run(commitAndPush);
  assert.deepEqual(empty.calls, []);
  assert.match(empty.messages.at(-1), /Stage changes/);
});

test("a push failure reports that the commit was created locally", async () => {
  const { calls, messages, run } = setup({ pushFails: true });
  await run(commitAndPush);
  assert.deepEqual(calls, [["commit", "primary", "New", true], ["push", "primary"]]);
  assert.match(messages.at(-1), /Commit created in primary\. Push did not complete/);
});
