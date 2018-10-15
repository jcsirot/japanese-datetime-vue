<template>
<v-card class="elevation-4">
  <v-container grid-list-md>

    <v-layout row wrap align-center justify-center fill-height>
      <v-flex xs3 lg3>
          <v-btn color="primary"
                :disabled="playing"
                 @click.native="play()">
          <v-icon>play_circle_outline</v-icon>
              Écoutez
          </v-btn>
      </v-flex>

      <v-flex xs6 lg6>
        <v-menu
          ref="menu1"
          :close-on-content-click="false"
          v-model="menu1"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px">
          <v-text-field
            slot="activator"
            v-model="dateFormatted"
            label="Quelle date avez-vous entendu ?"
            hint="JJ/MM/AAAA"
            persistent-hint
            prepend-icon="event"
            @blur="date = parseDate(dateFormatted)"
          ></v-text-field>
          <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
        </v-menu>
      </v-flex>

      <v-flex xs3 lg3>
          <v-btn ref="verifyBtn" :color="color"
            :loading="loading"
            :disabled="loading || nodate"
            class="white--text"
            @click.native="loader = 'loading'">
              <v-icon v-if="result=='success'">done</v-icon>
              <v-icon v-if="result=='error'">error</v-icon>
              <span v-if="result==''">Vérifiez</span>
              <span v-if="result=='success'">Correct</span>
              <span v-if="result=='error'">Réessayez</span>
          </v-btn>
      </v-flex>

    </v-layout>
  </v-container>
  <audio id="player" ref="player" :src="audioFile"></audio>
</v-card>
</template>

<script>
  export default {
    data: () => ({
      date: null,
      generatedDate: null,
      nodate: true,
      dateFormatted: null,
      menu1: false,
      loader: null,
      loading: false,
      color: 'primary',
      audio: undefined,
      audioFile: null,
      playing: false,
      result: ""
    }),

    computed: {
      computedDateFormatted () {
        return this.formatDate(this.date)
      }
    },

    watch: {
      date () {
        this.nodate = this.date == null || this.date == undefined 
        this.dateFormatted = this.formatDate(this.date)
        this.color = "primary"
        this.result = ""
      },

      loader () {
        const l = this.loader
        this[l] = !this[l]
        setTimeout(() => {
            this[l] = false
            let x = Math.floor(Math.random() * Math.floor(2));
            if (x == 0) {
                this.result = 'success'
                this.color = 'success'
            } else {
                this.result = 'error'
                this.color = 'error'
            }
        }, 1000)
        this.loader = null
      }
    },

    mounted () {
        this.audio = this.$refs.player;
        this.audio.addEventListener('ended', _ => this.playing = false)
        this.generateDate()
    },

    methods: {
      formatDate (date) {
        if (!date) return null

        const [year, month, day] = date.split('-')
        return `${month}/${day}/${year}`
      },
      parseDate (date) {
        if (!date) return null

        const [month, day, year] = date.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      },
      generateDate () {
        let start = new Date(1950, 1, 1)
        let end = new Date(2049, 12, 31)
        this.generatedDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
        console.log(this.generatedDate)
      },
      hasDate () {
          return this.date != null && this.date != undefined
      },
      play () {
          console.log('Play')
          let context = new AudioContext()
          let dayUrl = './audio/' + (this.generatedDate.getMonth() + 1) + '_' + this.generatedDate.getDate() + '.mp3'
          let yearUrl = './audio/' + this.generatedDate.getFullYear() + '.mp3'
          Promise.all([
              this.$http.get(yearUrl, { responseType: 'arraybuffer'}),
              this.$http.get(dayUrl, { responseType: 'arraybuffer'})
          ]).then(responses => {
              console.log(responses)
              context.decodeAudioData(responses[0].body, buffer1 => context.decodeAudioData(responses[1].body, buffer2 => this.playBuffer(context, buffer1, buffer2)))
          }).catch(responses => {
              console.error("Loading audio failed")
              console.log(responses)
          })
          if (! this.audioReady) {
             this.audioFile = './audio/8_3.mp3'
             this.audio.addEventListener('canplay', _ => {
                 this.audioReady = true
                 //this.audio.play().then(_ => this.playing = true)
             })          
          } else {
            //this.audio.play().then(_ => this.playing = true)
          }
      },
      playBuffer (context, buffer1, buffer2) {
        var source = context.createBufferSource(); // creates a sound source
        source.buffer = this._appendBuffer(context, buffer1, buffer2)                    // tell the source which sound to play
        source.connect(context.destination);       // connect the source to the context's destination (the speakers)
        source.start(0);                           // play the source now
      },
    
      _appendBuffer (context, buffer1, buffer2) {
        var numberOfChannels = Math.min( buffer1.numberOfChannels, buffer2.numberOfChannels );
        var tmp = context.createBuffer( numberOfChannels, (buffer1.length + buffer2.length), buffer1.sampleRate );
        for (var i=0; i<numberOfChannels; i++) {
            var channel = tmp.getChannelData(i);
            channel.set( buffer1.getChannelData(i), 0);
            channel.set( buffer2.getChannelData(i), buffer1.length);
        }
        return tmp;
      }
    }
  }
</script>

<style>
  .v-text-field input {
    color: white;
    font-weight: 700;
  }
</style>
