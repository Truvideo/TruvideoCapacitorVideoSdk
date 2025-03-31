import { TruvideoSdkVideo } from 'truvideo-capacitor-video-sdk';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    TruvideoSdkVideo.echo({ value: inputValue })
}
