import * as React from "react";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { Box } from "@/components/ui/box";
import { useVideoPlayer, VideoView } from 'expo-video';
import { Dimensions } from "react-native";



const defaultDataWith6Colors = [
  "#B0604D",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#F1F1F1",
];

const CarouselComponent = () => {
  const { width: windowWidth } = Dimensions.get('window');

  const progress = useSharedValue<number>(0);
  const player1 = useVideoPlayer("https://api.cogit-lab.com/documents/idle_video/47cc5e77-54dd-4c74-983b-078ea12435aa_cropped_resized_idle.mp4", player => {
    player.loop = true;
    player.play();
  });
  const player2 = useVideoPlayer("https://api.cogit-lab.com/documents/idle_video/f050269a-f64d-4dc3-b835-cef9d1a37c70_cropped_resized_idle.mp4", player => {
    player.loop = true;
    player.play();
  });
  const player3 = useVideoPlayer("https://api.cogit-lab.com/documents/idle_video/c9c8e3c7-ac0b-472b-8d7a-f84e349b25fd_cropped_resized_idle.mp4", player => {
    player.loop = true;
    player.play();
  });
  const player4 = useVideoPlayer("https://api.cogit-lab.com/documents/idle_video/3ddba8f5-0d2c-4932-a172-09986ee12c3c_cropped_resized_idle.mp4", player => {
    player.loop = true;
    player.play();
  });

  return (
    <View>
      <Carousel
        autoPlay={true}
        autoPlayInterval={5000}
        data={[player1, player2, player3, player4]}
        height={350}
        loop={true}
        snapEnabled={true}
        width={windowWidth / 2}
        style={{
          width: windowWidth,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        onProgressChange={progress}
        renderItem={({ item, index }: { item: any, index: number }) => {
          return (
            <Box className="shadow-hard-5">
              <VideoView playsInline nativeControls={false} contentFit="cover" style={{ width: windowWidth / 2, height: '100%', borderRadius: 20 }} player={item} />
            </Box>
          );
        }}
      />
    </View>
  );
}

export default CarouselComponent;
