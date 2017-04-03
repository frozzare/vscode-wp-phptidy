const vscode = require('vscode');
const exec = require('child_process').exec;
const fs = require('fs');
const tmp = require('tmp');

// this method is called when your extension is activated
function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.wp-phptidy', function () {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            return;
        }

        const name = tmp.tmpNameSync();
        if (!name) {
            return;
        }

        const text = editor.document.getText();
        if (!text) {
            return;
        }

        try {
            fs.writeFileSync(name, text);
        } catch (e) {
            return;
        }

        const cmd = 'php ' + __dirname + '/wp-phptidy.php replace ' + name;
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                return;
            }

            try {
                var data = fs.readFileSync(name, 'utf8');
            } catch (e) {
                return;
            }
            
            editor.edit(function (editorBuilder) {
                const document = editor.document;
		const lastLine = document.lineAt(document.lineCount - 2);

                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(document.lineCount - 1, lastLine.text.length);
                
                editorBuilder.replace(new vscode.Range(start, end), data);
            }, {
                undoStopBefore: true,
                undoStopAfter: false
            });
        });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
