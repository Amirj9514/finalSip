import { Component, OnInit } from '@angular/core';
import * as JsSIP from 'jssip';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'finalSip';

  host: string = 'tbcla01.cherryberrycloud.com';
  user: any = '577';
  pass: any = 'xpm567cfg';
  remoteUser: any = '04232119293';
  socketAddress: any;
  uriAddress: any;
  userAgent: any;

  dtmfVal: any = '';

  dialedNumber: any = '03451450106';

  // -----------------------------------------------------------------------------------------------------------------
  //         JSSIP Variables
  //------------------------------------------------------------------------------------------------------------------

  // socketAddress = 'wss://tbcla01.cherryberrycloud.com:8089/ws'
  sipUser: any;
  session: any;

  isUsRegister: number = 0;
  inboundOptions = {
    mediaConstraints: {
      audio: true,
      video: false,
    },
  };
  outboundOptions: any = {
    mediaConstraints: {
      audio: true,
      video: false,
    },
    pcConfig: {
      iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
    },
    extraHeaders: [],
  };

  ngOnInit(): void {
    this.createConnectionWithSocket();
  }

  createConnectionWithSocket() {
    this.socketAddress = `wss://${this.host}:8089/ws`;
    this.sipUser = `sip:${this.user}@${this.host}`;
    let socket = new JsSIP.WebSocketInterface(this.socketAddress);
    this.userAgent = new JsSIP.UA({
      sockets: [socket],
      uri: this.sipUser,
      password: this.pass,
    });

    if (this.isUsRegister <= 2) {
      this.userAgentInit();
    }
  }

  userAgentInit(): void {
    // if (this.userAgent) {
    this.userAgent.start();
    // }
    this.userAgent.on('registered', (e: any) => {
      /* Your code here */
      console.log('Register', e);
    });

    this.isUsRegister = this.isUsRegister + 1;

    this.userAgent.on('newRTCSession', (e: any) => {
      this.session = e.session;
      this.sessionStatus();
    });
  }

  addQ() {
    this.dialedNumber = '5111';
    this.connectCall();
  }

  connectCall() {
    this.remoteUser = `sip:${this.dialedNumber}@${this.host}`;

    this.outboundOptions.extraHeaders = [`X-CLI:${this.remoteUser}`];

    try {
      this.session = this.userAgent.call(this.remoteUser, this.outboundOptions);
      this.addRemoteAudio(this.session);
    } catch (error) {}
  }

  sessionStatus() {
    console.log(this.session);

    if (this.session.direction === 'incoming') {
      const callerNumber = this.session.remote_identity.uri.user;
      console.log('Incoming call from:', callerNumber);
    }
    this.session.on('progress', (res: any) => {
      console.log('progress', res.originator);

      if (res.originator === 'remote') {
        // Check if the server is generating the ringing sound
        // if (!e.response.headers['alert-info']) {
        //   // Play local ringing sound if the server is not generating it
        //   this.playLocalRinging();
        // }
      }
      // this.callingStatus = 'Ringing';
      // this.callStart = true;
    });
    this.session.on('accepted', (res: any) => {
      console.log('accepted');
      // this.callingStatus = 'Connected';
      // this.startTimer();
      // this.pauseRingingTone();
      // this.incomingCall = false;
      // if (this.globalMute) {
      //   this.session.mute();
      // }
    });
    this.session.on('confirmed', (res: any) => {
      console.log('confirm');
    });

    this.session.on('ended', (res: any) => {
      console.log('ended');
      // this.callStart = false;
      // this.stopTimer();
      // this.pauseRingingTone();
      // this.incomingCall = false;
    });
    this.session.on('failed', (res: any) => {
      console.log('failed');
      // this.toastS.show('Call Failed', {
      //   classname: 'bg-danger text-light',
      //   delay: 5000,
      // });

      // this.toastS;
      // this.callStart = false;
      // this.stopTimer();
      // this.pauseRingingTone();
      // this.incomingCall = false;
    });
  }
  addDtmf() {
    this.sendDtmf(this.dtmfVal);
  }
  sendDtmf(number: any) {
    this.session.sendDTMF(number);
  }

  micMute() {
    // if (this.mute === false) {
    //   this.onMute();
    // } else {
    //   this.unMute();
    // }
  }

  addAgent() {
    this.dialedNumber = '66301';
    this.connectCall();
  }

  onMute() {
    this.session.mute();
  }

  unMute() {
    this.session.unmute();
  }
  onHold() {
    this.session.hold();
  }
  unHold() {
    this.session.unhold();
  }

  endCall() {
    if (this.session) this.session.terminate();
    this.session = undefined;
  }
  callAccept() {
    this.session.answer(this.inboundOptions);
    this.addRemoteAudio(this.session);
  }

  addRemoteAudio(audioSession: any) {
    audioSession.connection.ontrack = (e: any) => {
      let audio = new Audio();
      audio.srcObject = e.streams[0];
      audio.load();
      audio.play();
    };
  }
}
