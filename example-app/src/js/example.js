import { TruvideoSdkVideo } from 'truvideo-capacitor-video-sdk';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    const value = ["vaisnuvn","savjas","svsaiuvnasi"]
    
    TruvideoSdkVideo.concatVideos({ 
        resultPath: "inputValue",
        videoUris : JSON.stringify(value)
    })
}
