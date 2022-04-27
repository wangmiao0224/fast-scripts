import * as vscode from 'vscode';
import { Package, Normal } from './types';


class TreeItem extends vscode.TreeItem {
  constructor(
    private version: string,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.description}`;
    this.description = ``;
  }
}

class treeCommand implements vscode.Command {
  title: string;
  command: string;
  tooltip?: string | undefined;
  arguments?:  any[] | undefined;
  constructor(title: string, command: string, arg: any[] | undefined) { 
    this.title = title;
    this.command = command;
    this.arguments = arg;
  }
}

class Tree implements vscode.TreeDataProvider<TreeItem> {
  scripts: Normal;
  version: string;
  onDidChangeTreeData?: vscode.Event<void | TreeItem | TreeItem[] | null | undefined> | undefined;
  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  constructor(pkg: Package) {
    this.scripts = pkg.scripts;
    this.version = pkg.version;
   }
  getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
    const list: TreeItem[] = [];
    if (!element) {
      for (const key in this.scripts) {
        const item = new TreeItem(this.version, `npm run ${key}`, vscode.TreeItemCollapsibleState.None);
        item.command = new treeCommand(key, 'fast-command.scripts', [key]);
        list.push(item);
      }
    } else {
      list.push(new TreeItem('1.0.0','test',vscode.TreeItemCollapsibleState.None))
    }
    return list;
  }
 
}


module.exports = (context: vscode.ExtensionContext, pkg: Package) => {
  
  const command = vscode.commands.registerCommand(`fast-command.scripts`, async (script) => {
    const terminal = vscode.window.createTerminal(script);
    terminal.show();
    terminal.sendText(`npm run ${script}`);
    vscode.window.showInformationMessage(`script：npm run ${script}`);
  });
  
  context.subscriptions.push(command);
  const tree = new Tree(pkg);
  const options: vscode.TreeViewOptions<TreeItem> = {
    treeDataProvider: tree,
    showCollapseAll: false
  }
  vscode.window.createTreeView('script-command',options);
};
