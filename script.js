window.addEventListener("DOMContentLoaded", () => {
    const websocket = new WebSocket("ws://localhost:6789/");
    let name = ""

    const chatWindow = document.querySelector("#chat-window");
    const messages = document.querySelector("#messages");
    const messageInput = document.querySelector("#message-input");
    const messageName = document.querySelector("#nome");
    document.querySelector("#message-form").style.display = "none"

    document.querySelector("#nome-form").addEventListener("submit", event => {
        event.preventDefault();
        const message = messageName.value;
        if (message.length === 0) return
        name = message
        document.querySelector("#message-form").style.display = "flex"
        document.querySelector("#nome-form").style.display = "none"
        websocket.send(JSON.stringify({ action: "message", message: `${name} entrou no chat!` }));
    });

    console.log(name)
    document.querySelector("#message-form").addEventListener("submit", event => {
        event.preventDefault();
        const message = messageInput.value;
        if (message.length === 0) return
        const dateTime = new Date()
        const min = dateTime.getMinutes().length === 1 ? `0${dateTime.getMinutes()}` : dateTime.getMinutes()
        
        websocket.send(JSON.stringify({ 
            action: "message", 
            message: `${name}: ${message} - ${dateTime.getHours()}:${min}` 
        }));
        messageInput.value = "";
    });

    document.querySelector(".minus").addEventListener("click", () => {
        websocket.send(JSON.stringify({ action: "minus" }));
    });

    document.querySelector(".plus").addEventListener("click", () => {
        websocket.send(JSON.stringify({ action: "plus" }));
    });

    websocket.onmessage = ({ data }) => {
        const event = JSON.parse(data);
        switch (event.type) {
            case "value":
                document.querySelector(".value").textContent = event.value;
                break;
            case "users":
                const users = `${event.count} usuário${event.count == 1 ? "" : "s"}`;
                document.querySelector(".users").textContent = users;
                break;
            case "message":
                if (event.messages.length === 0) {
                    break
                }
                const li = document.createElement("li");
                li.textContent = `${event.messages.pop()}`;
                messages.appendChild(li);
                chatWindow.scrollTop = chatWindow.scrollHeight;
                break
            default:
                console.error("unsupported event", event);
        }
    };
});