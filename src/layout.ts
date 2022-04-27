import * as vscode from 'vscode';
import { Package } from './types';
import COMMAND from './common/Command';
import { TreeItem } from './common/TreeView';
import VsPackage from './common/VsPackage';
import * as fs from "fs";
import { join,relative } from "path";




class Tree implements vscode.TreeDataProvider<TreeItem> {
    pkgs: Package[];
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    onDidChangeTreeData?: vscode.Event<void | TreeItem | TreeItem[] | null | undefined> | undefined =this._onDidChangeTreeData.event ;
    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
       return element
    }
    getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
        if (!element) return this.pkgs.map(pkg => new VsPackage(pkg).getPackageTree())
        else return element.childs
       
    }
    refresh(): void {
        this.pkgs = getPkg()
      this._onDidChangeTreeData.fire();
    }

    constructor(pkgs: Package[]) {
        this.pkgs = pkgs;
     }
}

module.exports = (context: vscode.ExtensionContext) => {
    
    
    VsPackage.registerCommand(context);
    const tree = new Tree(getPkg())
    const options: vscode.TreeViewOptions<TreeItem> = {
        treeDataProvider: tree,
        showCollapseAll: true
    };
    vscode.commands.registerCommand(COMMAND.COMMAND_REFRESH, (key) => {
        tree.refresh()
    })
    
    vscode.commands.registerCommand(COMMAND.COMMAND_RUN, (key) => {
        const terminal = vscode.window.createTerminal(key.label);
    terminal.show();
    terminal.sendText(`npm run ${key.label}`);
    vscode.window.showInformationMessage(`script：npm run ${key.label}`);
     })
   

    vscode.window.createTreeView(COMMAND.COMMAND,options);
};

function getPkg() {
    const workspace = vscode.workspace.workspaceFolders;
    const path: string = workspace?.[0]?.uri.path || "";
      const pkgs = readFile(path).map(pkg => {
		pkg.relativePath = relative(path, pkg.path) + '/'
		return pkg;
      });
    return pkgs
}


// 遍历读取文件
function readFile(path: string, filesList: Package[] = []) {
	const files = fs.readdirSync(path); // 需要用到同步读取
	files.forEach((file) => {
	  const states = fs.statSync(path + "/" + file);
	  // ❤❤❤ 判断是否是目录，是就继续递归
	  if (states.isDirectory()) {
		const reg = /node_modules/;
		if (!reg.test(file)) {
		  readFile(path + "/" + file, filesList);
		}
	  } else {
		const reg = /package.json/;
		if (reg.test(file)) {
		  const pkg: Package = JSON.parse(
			fs.readFileSync(join(path, file)).toString()
		  );
		  pkg.path = path;
		  filesList.push(pkg);
		}
	  }
	});
	return filesList;
  }