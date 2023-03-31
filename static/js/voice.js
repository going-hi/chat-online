const voiceBtn = document.getElementById('voice')
let startedVoice = false
navigator.mediaDevices.getUserMedia({ audio: true})
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);

        voiceBtn.addEventListener('click', function(){
            if(startedVoice) {
                mediaRecorder.stop()
                voiceBtn.classList.remove('record')
                startedVoice = false
            }else {
                mediaRecorder.start();
                voiceBtn.classList.add('record')
                startedVoice = true
            }
            
        });
        let audioChunks = [];
        mediaRecorder.addEventListener("dataavailable",function(event) {
            audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", async function() {
            const audioBlob = new Blob(audioChunks, {
                type: 'audio/mpeg'
            });
            let message
            if(eventChat.selectType === 'room') {
                message = await eventChat.sendAudioMessageRoom(eventChat.selectChatId, audioBlob)
            }else {
                message = await eventChat.sendAudioMessageChat(eventChat.selectChatId, audioBlob)
            }
            chatBlock.renderAudioMessage(message)
            audioChunks = [];
        });
    });


