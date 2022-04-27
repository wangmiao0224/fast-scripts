import * as vscode from "vscode";
import { Normal, Package } from "../types";
import COMMAND from "./Command";
import { TreeItem } from "./TreeView";
import { join } from "path"; 

export default class VsPackage {
  scripts: Normal;
  devDePendencies: Normal;
  dePendencies: Normal;
  version: string;
  pkg:Package
  static isRegister: boolean = false
  constructor(pkg: Package) {
    this.scripts = pkg.scripts;
    this.devDePendencies = pkg.devDependencies;
    this.dePendencies = pkg.dependencies;
    this.version = pkg.version;
    this.pkg = pkg
  }

   static registerCommand(context:vscode.ExtensionContext) {
    if (VsPackage.isRegister) return;
    const command1 = vscode.commands.registerCommand(COMMAND.COMMAND_NPM, (key) => {
      vscode.env.openExternal(
        vscode.Uri.parse(`https://www.npmjs.com/package/${key}`)
      );
    });
       vscode.commands.registerTextEditorCommand
       const command2 = vscode.commands.registerCommand(COMMAND.COMMAND_COPY, (key, path) => {
    //   const terminal = vscode.window.createTerminal(key);
    //   terminal.show();
    //   terminal.sendText(`npm run ${key}`);
      vscode.window.showInformationMessage(`script：npm run ${key}`);
       });
       context.subscriptions.push(command1, command2);
       VsPackage.isRegister = true
  }

  private _getVsScripts(): TreeItem[] {
    if (!this.scripts) {
      return [];
    }
    const treeList: TreeItem[] = [];
    for (const key in this.scripts) {
      const item = new TreeItem(
        this.version,
        key,
        vscode.TreeItemCollapsibleState.None
      );
      treeList.push(item);
        item.iconPath = vscode.Uri.file(join(__dirname, '..', 'media', 'npm.png'));
        item.contextValue = 'run'
      item.command = {
        title: key,
        tooltip: this.scripts[key],
        command: COMMAND.COMMAND_COPY,
        arguments: [key,this.pkg.path],
      };
    }
    return treeList;
  }
  private _getVsDependencies(): TreeItem[] {
    if (!this.dePendencies) {
      return [];
    }
    const treeList: TreeItem[] = [];
    for (const key in this.dePendencies) {
      const item = new TreeItem(
        this.version,
        `${key}@${this.dePendencies[key]}`,
        vscode.TreeItemCollapsibleState.None
      );
      treeList.push(item);
      item.iconPath = vscode.Uri.file(join(__dirname,'..','media','npm.png'));
      item.command = {
        title: key,
        tooltip: this.dePendencies[key],
        command: COMMAND.COMMAND_NPM,
        arguments: [key],
      };
    }
    return treeList;
  }
  private _getVsDevDependencies(): TreeItem[] {
    if (!this.devDePendencies) {
      return [];
    }
    const treeList = [];
    for (const key in this.devDePendencies) {
      const item = new TreeItem(
        this.version,
        `${key}@${this.devDePendencies[key]}`,
        vscode.TreeItemCollapsibleState.None
      );
      treeList.push(item);
      item.iconPath = vscode.Uri.file('../../media/npm.png');
      item.command = {
        title: key,
        tooltip: this.devDePendencies[key],
        command: COMMAND.COMMAND_NPM,
        arguments: [key],
      };
    }
    return treeList;
  }
  getPackageTree(): TreeItem {
    const list: TreeItem[] = [
      new TreeItem(
        this.version,
        "script",
        vscode.TreeItemCollapsibleState.Collapsed,
        this._getVsScripts()
      ),
      new TreeItem(
        this.version,
        "devDependencies",
        vscode.TreeItemCollapsibleState.Collapsed,
        this._getVsDevDependencies()
      ),
      new TreeItem(
        this.version,
        "dependencies",
        vscode.TreeItemCollapsibleState.Collapsed,
        this._getVsDependencies()
      ),
    ];
      const treeItem = new TreeItem(
        this.version,
        `${this.pkg.relativePath==='/'?'':this.pkg.relativePath}package.json`,
        vscode.TreeItemCollapsibleState.Collapsed,
        list
      );
      treeItem.contextValue = 'view/title';
    return  treeItem
  }
}
