class VoiceMessage {
    constructor(link, my, username) {
        this.$ = document.createElement('div')
        this.$.classList.add('message')

        this.$.style.maxWidth = '50%'

        this.$progress = document.createElement('div')
        this.$progress.classList.add('message__audio--time')

        this.$messageBody = document.createElement('div')
        this.$messageBody.classList.add('message__audio')

        this.$button = document.createElement('button')
        this.$button.classList.add('btn', 'message__audio--play')
        this.$button.innerHTML = getPlayElementSvg('play')
        
        this.$voice__wave = document.createElement('div')
        this.$voice__wave.classList.add('voice__wave')


       if(my) {
            this.$.classList.add('my')
        }else {
            this.$.innerHTML =  `<div class="message__author">${username}</div>`
        }
       

        this.waveSurfer = WaveSurfer.create({
            container: this.$voice__wave,
            waveColor: '#D2D2D2',
            progressColor: '#a30065',
            cursorWidth: 0,
            barWidth: 2,
            barHeight: 4,
            minPxPerSec: 10,
            barMinHeight: 1,
            barRadius: 1,
            barGap: 3,
            height: 30,
            responsive: true,
            fillParent: true,
            hideScrollbar: true,
        });
        this.waveSurfer.load(link)


        this.waveSurfer.on('ready', () => {
            const duration = this.waveSurfer.getDuration()
            this.$progress.innerHTML = calculateDate(duration)
        })

        this.waveSurfer.on('audioprocess', () => {
            const currentTime = this.waveSurfer.getCurrentTime()
            this.$progress.innerHTML = calculateDate(currentTime)
        })

        this.waveSurfer.on('seek', () => {
            let time = this.waveSurfer.getCurrentTime()
            if(time === 0) {
                time = this.waveSurfer.getDuration()
            }
            this.$progress.innerHTML = calculateDate(time)
        })

        this.waveSurfer.on('finish', () => {
            this.waveSurfer.stop()
            this.$button.innerHTML = getPlayElementSvg('play')
        })


        this.$button.addEventListener('click', () => {
            if(this.waveSurfer.isPlaying()){
                this.waveSurfer.pause()
                this.$button.innerHTML = getPlayElementSvg('play')
            }else {
                this.waveSurfer.play()
                this.$button.innerHTML = getPlayElementSvg()
            }
        })
        
        this.$messageBody.append(this.$button, this.$voice__wave)
        this.$.append(this.$messageBody)
        this.$.append(this.$progress)
    }


    get html() {
        return this.$
    }
}


function calculateDate(time) {
   const minutes = Math.floor(time / 60).toString().padStart(2, '0')
   const second = Math.floor(time % 60).toString().padStart(2, '0')
   return `${minutes}:${second}`
}

function getPlayElementSvg(type) {
    if(type === 'play'){
        return `<svg viewBox="0 0 24 24" fill="#a30065" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M8.286 3.407A1.5 1.5 0 0 0 6 4.684v14.632a1.5 1.5 0 0 0 2.286 1.277l11.888-7.316a1.5 1.5 0 0 0 0-2.555L8.286 3.407z" fill="#a30065"></path></g></svg>`
    }else {    
        return `<svg fill="#a30065" viewBox="-5.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>pause</title> <path d="M0 6.563v18.875c0 0.531 0.438 0.969 0.969 0.969h6.625c0.5 0 0.906-0.438 0.906-0.969v-18.875c0-0.531-0.406-0.969-0.906-0.969h-6.625c-0.531 0-0.969 0.438-0.969 0.969zM12.281 6.563v18.875c0 0.531 0.438 0.969 0.938 0.969h6.625c0.531 0 0.969-0.438 0.969-0.969v-18.875c0-0.531-0.438-0.969-0.969-0.969h-6.625c-0.5 0-0.938 0.438-0.938 0.969z"></path> </g></svg>`
    }
}
