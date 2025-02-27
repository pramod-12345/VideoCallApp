import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import {
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
} from "react-native-agora";
import {
  AGORA_APP_ID,
  AGORA_CHANNEL_NAME,
  AGORA_TEMP_TOKEN,
} from "../utils/agoraConfig";
import { requestPermissions } from "../utils/Permissions";

const { width, height } = Dimensions.get("window");

const VideoCall: React.FC = () => {
  const [engine, setEngine] = useState<IRtcEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  useEffect(() => {
    const initAgora = async () => {
      if (!(await requestPermissions())) return;
      const agoraEngine = createAgoraRtcEngine();
      agoraEngine.initialize({
        appId: AGORA_APP_ID,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });
      agoraEngine.enableVideo();
      agoraEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: (_, __) => setJoined(true),
        onUserJoined: (_, uid) => setRemoteUid(uid),
        onUserOffline: (_, __) => setRemoteUid(null),
      });
      setEngine(agoraEngine);
    };

    initAgora();
    return () => engine?.release();
  }, []);

  const joinChannel = async () => {
    if (!engine) return;
    try {
      await engine.joinChannel(AGORA_TEMP_TOKEN, AGORA_CHANNEL_NAME, 0, {});
    } catch (error) {
      Alert.alert("Error", "Failed to join call");
    }
  };

  const leaveChannel = () => {
    engine?.leaveChannel();
    setJoined(false);
    setRemoteUid(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {joined ? (
          <>
{(remoteUid || 1) && 
  <RtcSurfaceView canvas={{ uid: remoteUid || 1 }} style={styles.remoteVideo} />
}

<View style={styles.localVideoContainer}>
  <RtcSurfaceView canvas={{ uid: 0 }} style={styles.localVideo} />
</View>

            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => {
                  engine?.muteLocalAudioStream(!isMuted);
                  setIsMuted(!isMuted);
                }}
                style={styles.controlButton}
              >
                <Text style={styles.controlButtonText}>{isMuted ? "Unmute" : "Mute"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  engine?.enableLocalVideo(!isVideoEnabled);
                  setIsVideoEnabled(!isVideoEnabled);
                }}
                style={styles.controlButton}
              >
                <Text style={styles.controlButtonText}>{isVideoEnabled ? "Disable Video" : "Enable Video"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  engine?.switchCamera();
                  setIsFrontCamera(!isFrontCamera);
                }}
                style={styles.controlButton}
              >
                <Text style={styles.controlButtonText}>Switch Camera</Text>
              </TouchableOpacity>
            </View>
              <TouchableOpacity onPress={leaveChannel} style={styles.endCallButton}>
                <Text style={styles.endCallText}>End Call</Text>
              </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.callButton} onPress={joinChannel}>
            <Text style={styles.callButtonText}>Start Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

  },
  remoteVideo: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "#000000", 
    zIndex: -1, 
    pointerEvents: "none", // Prevents it from blocking touches
  },
  
  localVideoContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? height * 0.05 : height * 0.02, 
    right: width * 0.05, 
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "#000000",
    zIndex: 10,
    overflow: "hidden",
  },
  localVideo: {
    width: width * 0.3, 
    height: height * 0.2,
    borderRadius: 10, // Keep the same border radius
  },
    
  
  controls: {
    position: "absolute",
    bottom: height * 0.05,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor:  Platform.OS === 'ios' ? "#eee" : '#fff',
    borderRadius: 8,
    alignItems: "center",
    minWidth: Platform.OS === 'ios' ? width * 0.22 : width * 0.18, 
    color:'#000000'
  },
  endCallButton: {
    paddingVertical: 12,
    backgroundColor: "red",
    borderRadius: 8,
    alignItems: "center",
    minWidth: Platform.OS === 'ios' ? width * 0.25 : width * 0.2,
    top: Platform.OS === 'ios' ?  height * -0.4 : height * -0.45,
    alignSelf:'flex-start',
    marginLeft: width * 0.05,},
  endCallText: {
    color: "white",
    fontWeight: "bold",
  },
  callButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  callButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  controlButtonText:{
    color:'#000000',
    fontSize:14,
    fontWeight:'400'
  }
});


export default VideoCall;