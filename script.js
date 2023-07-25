const url = 'https://mock-api.driven.com.br/api/v6/uol';
let username;
let messages = [];

let idIntervalConnecting, idIntervalfindMessage;

function start() {

    username = prompt('Qual o seu nome?');

    while (username === '' || username === null) {
        alert('Digite um nome válido!');
        username = prompt('Qual o seu nome?');
    }

    let promise = axios.post(`${url}/participants`, { name: username });

    promise.then(response => {
        findMessage();
        idIntervalfindMessage = setInterval(findMessage, 3000);
    });

    promise.catch(error => {
        if (error.response.status === 400) {
            alert('Esse usuário já está em uso, por favor tente novamente');
            window.location.reload(true);
        } else {
            alert('Ocorreu um erro no servidor! Tente novamente mais tarde');
        }
    });


    idIntervalConnecting = setInterval(() => {
        promise = axios.post(`${url}/status`, { name: username });

        promise.catch(error => {
            alert('Ocorreu um erro inesperado, tente mais tarde!');
            window.location.reload(true);
        });

    }, 5000);
}

start();

function sendMessage() {

    const inputElement = document.querySelector('.input-mensagem');

    const message = {
        from: username,
        to: "Todos",
        text: inputElement.value,
        type: "message"
    };

    const promise = axios.post(`${url}/messages`, message);
    promise.then(succesfullMessage);
    promise.catch(errorSendingMessage);

    inputElement.value = '';
}

function succesfullMessage(response) {
    findMessage();
}

function renderMessage(messages) {

    const ulMessage = document.querySelector('.message-container');

    ulMessage.innerHTML = '';

    const liElements = messages.map(message => {

        let template = '';

        if (message.type === 'message') {
            template = `
                <li class="public-message">
                    <div class="div-user">
                        <span class="time">${message.time}</span>
                            <strong>${message.from}</strong>
                            <span> para </span>
                            <strong>${message.to}: </strong>
                        <span>${message.text}</span>
                    </div>
                </li>
            `;
        } else if (message.type === 'private_message') {
            if (message.to === username || message.from === username) {
                template = `
                    <li class="private-message">
                        <div class="div-user">
                            <span class="time">${message.time}</span>
                                <strong>${message.from}</strong>
                                <span> reservadamente para </span>
                                <strong>${message.to}: </strong>
                            <span>${message.text}</span>
                        </div>
                    </li>
                `;
            }
        } else if (message.type === 'status') {
            template = `
                <li class="in-and-out-message">
                    <span class="time">${message.time}</span>
                    <strong>${message.from}</strong>
                    <span>${message.text}</span>
                </li>
            `;
        }

        return template;

    });

    liElements.forEach(li => {
        ulMessage.innerHTML += li;
    });

}

function getMessage(response) {
    renderMessage(response.data);
}

function findMessage() {
    const promise = axios.get(`${url}/messages`);
    promise.then(getMessage);
}
