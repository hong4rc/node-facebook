const socket = io();
socket.on('new_msg', msg => {
    $('#messages').append(
        $('<li>').prepend(
            $('<pre>').text(JSON.stringify(msg, null, 2))
        )
    );
});
