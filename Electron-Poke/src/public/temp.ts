class Temp {
    constructor() {
        document.onreadystatechange = () => {
            let nodeVersion = document.getElementById('nodeVersion') as HTMLParagraphElement;
            nodeVersion.innerText = process.versions.node;

            let chromeVersion = document.getElementById('chromeVersion') as HTMLParagraphElement;
            chromeVersion.innerText = process.versions.chrome;

            let electronVersion = document.getElementById('electronVersion') as HTMLParagraphElement;
            electronVersion.innerText = process.versions.electron;
        };

        let ipcRenderer = require('electron').ipcRenderer;
        ipcRenderer.on('new-message', (event, args) => {
            console.log('New Message', args);
            let obj = JSON.parse(args);
            let messages = document.getElementById('messages');
            let li = document.createElement('li');
            li.appendChild(document.createTextNode(`${obj.contact.name} :: ${obj.contact.phoneNumber} :: ${obj.message}`));
            messages.appendChild(li);
        });

        let submitButton = document.getElementById('submitButton') as HTMLInputElement;
        let textBox = document.getElementById('msgToAndroid') as HTMLInputElement;
        submitButton.onclick = function () {
            let obj = {
                contact: {
                    phoneNumber: 'FILL_IN_TO_SEND_DEBUG_MESSAGE'
                },
                message: textBox.value
            };
            textBox.value = '';
            ipcRenderer.send('newMessageForAndroid', JSON.stringify(obj));
        };
    }
}

new Temp();