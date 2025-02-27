import React from "react";
import { SafeAreaView } from "react-native";
import VideoCall from "./src/screens/VideoCall";

const App: React.FC = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <VideoCall />
        </SafeAreaView>
    );
};

export default App;
