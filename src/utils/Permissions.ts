import { Platform, PermissionsAndroid } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

export const requestPermissions = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      if (
        granted[PermissionsAndroid.PERMISSIONS.CAMERA] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("❌ Android permissions denied");
        return false;
      }
      console.log("✅ Android permissions granted");
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else if (Platform.OS === "ios") {
    try {
      console.log("📢 Checking iOS permissions...");

      const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
      const micStatus = await check(PERMISSIONS.IOS.MICROPHONE);

      if (cameraStatus === RESULTS.GRANTED && micStatus === RESULTS.GRANTED) {
        console.log("✅ iOS permissions already granted");
        return true;
      }

      console.log("📢 Requesting iOS permissions...");
      const newCameraStatus = await request(PERMISSIONS.IOS.CAMERA);
      const newMicStatus = await request(PERMISSIONS.IOS.MICROPHONE);

      console.log(`📸 Camera Permission: ${newCameraStatus}`);
      console.log(`🎤 Microphone Permission: ${newMicStatus}`);

      if (newCameraStatus !== RESULTS.GRANTED || newMicStatus !== RESULTS.GRANTED) {
        console.log("❌ iOS permissions denied");
        return false;
      }

      console.log("✅ iOS permissions granted");
      return true;
    } catch (err) {
      console.warn("⚠️ Error requesting iOS permissions:", err);
      return false;
    }
  }
  return true;
};
