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
          :disabled="isSuccess"
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
            label="Quelle date avez-vous entendue ?"
            hint="JJ/MM/AAAA"
            persistent-hint
            prepend-icon="event"
            @blur="date = parseDate(dateFormatted)"
          ></v-text-field>
          <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
        </v-menu>
      </v-flex>

      <v-flex xs2 lg2>
          <v-btn ref="verifyBtn" :color="color"
            :loading="loading"
            :disabled="loading || nodate"
            class="white--text"
            @click.native="verify()">
              <v-icon v-if="result=='success'">done</v-icon>
              <v-icon v-if="result=='error'">error</v-icon>
              <span v-if="result==''">Vérifiez</span>
              <span v-if="result=='success'">Correct</span>
              <span v-if="result=='error'">Réessayez</span>
          </v-btn>
      </v-flex>

      <v-flex xs1 lg1>
          <v-btn color="primary"
            class="white--text"
            v-if="result=='success'"
            @click.native="newDate()">
              <span>Nouvelle date</span>
          </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</v-card>
</template>

<script>
export default {
  data: () => ({
    date: null,
    generatedDate: null,
    dateFormatted: null,
    menu1: false,
    loader: null,
    loading: false,
    //color: "primary",
    playing: false,
    result: ""
  }),

  computed: {
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
    color() {
      if (this.result == "success" || this.result == "error") {
        return this.result;
      } else {
        return "primary";
      }
    },
    isSuccess() {
      return this.result == "success";
    },
    nodate() {
      return this.date == null || this.date == undefined;
    }
  },

  watch: {
    date() {
      this.dateFormatted = this.formatDate(this.date);
      this.result = "";
    },

    loader() {
      const l = this.loader;
      this[l] = !this[l];
      setTimeout(() => {
        this[l] = false;
        if (this.date == this.formatGeneratedDate(this.generatedDate)) {
          this.result = "success";
        } else {
          this.result = "error";
        }
      }, 1000);
      this.loader = null;
    }
  },

  mounted() {
    this.generateDate();
  },

  methods: {
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    formatGeneratedDate(date) {
      if (!date) return null;

      return `${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(
        -2
      )}-${("00" + date.getDate()).slice(-2)}`;
    },
    parseDate(date) {
      if (!date) return null;

      const [day, month, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    generateDate() {
      this.date = null;
      let start = new Date(1950, 1, 1);
      let end = new Date(2049, 12, 31);
      this.generatedDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      //console.log(this.generatedDate);
    },
    play() {
      let context = new AudioContext();
      let dayUrl =
        "./audio/" +
        (this.generatedDate.getMonth() + 1) +
        "_" +
        this.generatedDate.getDate() +
        ".mp3";
      let yearUrl = "./audio/" + this.generatedDate.getFullYear() + ".mp3";
      Promise.all([
        this.$http.get(yearUrl, { responseType: "arraybuffer" }),
        this.$http.get(dayUrl, { responseType: "arraybuffer" })
      ])
        .then(responses => {
          context.decodeAudioData(responses[0].body, buffer1 =>
            context.decodeAudioData(responses[1].body, buffer2 =>
              this.playBuffer(context, buffer1, buffer2)
            )
          );
        })
        .catch(responses => {
          console.error("Loading audio failed");
          console.log(responses);
        });
    },

    playBuffer(context, buffer1, buffer2) {
      var source = context.createBufferSource(); // creates a sound source
      source.buffer = this._appendBuffer(context, buffer1, buffer2); // tell the source which sound to play
      source.connect(context.destination); // connect the source to the context's destination (the speakers)
      source.start(0); // play the source now
    },

    verify() {
      if (this.result == "success") {
        return;
      }
      this.loader = "loading";
    },

    newDate() {
      this.generateDate();
      this.play();
    },

    _appendBuffer(context, buffer1, buffer2) {
      var numberOfChannels = Math.min(
        buffer1.numberOfChannels,
        buffer2.numberOfChannels
      );
      var tmp = context.createBuffer(
        numberOfChannels,
        buffer1.length + buffer2.length,
        buffer1.sampleRate
      );
      for (var i = 0; i < numberOfChannels; i++) {
        var channel = tmp.getChannelData(i);
        channel.set(buffer1.getChannelData(i), 0);
        channel.set(buffer2.getChannelData(i), buffer1.length);
      }
      return tmp;
    }
  }
};
</script>

<style>
.v-text-field input {
  color: white;
  font-weight: 700;
}
</style>
