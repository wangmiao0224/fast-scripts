import * as vscode from 'vscode';
import { Package, Normal } from './types';
import { join} from 'path'


class TreeItem extends vscode.TreeItem {
  constructor(
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
  devDependencies: Normal;
  dependencies: Normal
  version: string;
  onDidChangeTreeData?: vscode.Event<void | TreeItem | TreeItem[] | null | undefined> | undefined;
  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  constructor(pkg: Package) {
    this.devDependencies = pkg.devDependencies;
    this.dependencies = pkg.dependencies
    this.version = pkg.version;
   }
  getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
    if (!element) {
      const devDepend = new TreeItem('devDependencies', vscode.TreeItemCollapsibleState.Collapsed)
      const depend = new TreeItem('dependencies',vscode.TreeItemCollapsibleState.Collapsed)
      return [devDepend, depend];
    } else {
      const title = element.label;
      if (title === 'devDependencies') { return getDependencies(this.devDependencies) }
      if (title === 'dependencies') { return getDependencies(this.dependencies) }
      return [];
    }
  }
 
}

/**
 * 获取devDependencies的vscode节点
 */
function getDependencies(data: Normal): TreeItem[] {
  if (!data) return []
  const list:TreeItem[] = []
  for (const key in data) {
    const item = new TreeItem(`${key}:${data[key]}`, vscode.TreeItemCollapsibleState.None)
    item.iconPath = vscode.Uri.file(join(__dirname,'..','media','npm.png'))
    item.command = new treeCommand(`${key}@${data[key]}`, 'fast-command.dependencies', [`${key}`]);
    list.push(item)
  }
  return list
}

module.exports = (context: vscode.ExtensionContext, pkg: Package) => {
  
  const command = vscode.commands.registerCommand(`fast-command.dependencies`, async (script) => {
    vscode.env.openExternal(vscode.Uri.parse(`https://www.npmjs.com/package/${script}`))
    
  });
  
  context.subscriptions.push(command);
  const tree = new Tree(pkg);
  const options: vscode.TreeViewOptions<TreeItem> = {
    treeDataProvider: tree,
    showCollapseAll: false
  };
  vscode.window.createTreeView('dependencies-command',options);
};
