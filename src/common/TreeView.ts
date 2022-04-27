import * as vscode from 'vscode'
export  class TreeItem extends vscode.TreeItem {
    constructor(
      private version: string,
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly childs?:TreeItem[]
    ) {
      super(label, collapsibleState);
      this.tooltip = `${this.label}-${this.description}`;
      this.description = ``;
      this.childs = childs;
    }
}
