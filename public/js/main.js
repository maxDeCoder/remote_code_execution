const key = Qs.parse(location.search, {
    ignoreQueryPrefix: true
}).key;
const socket = io()
outputs = []

socket.emit("join", {key:key})
socket.on('general', info => {
    console.log(info)
});;
socket.on("output", info => {
    console.log(info)
    updateOutputs(info)
});

async function updateOutputs(data){
    document.getElementById("command").innerHTML = data.command;
    out = data.output.stdout;

    document.getElementById("stdout").innerHTML = `
        <div>
            <p>${data.output.stdout}
        </div>
    `;
    document.getElementById("stderr").innerHTML = `
    <div>
        <p>${data.output.stderr}
    </div>
`;;
}

async function killClient(){

}

async function resetClient(){

}

function sendCommand(){
    socket.emit("new command", {
        command:document.getElementById("text_command").value,
        key:key
    })
    document.getElementById("text_command").value = ""
}