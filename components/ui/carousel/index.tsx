import * as React from "react";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { Box } from "@/components/ui/box";
import { useVideoPlayer, VideoView } from 'expo-video';
import { Dimensions } from "react-native";

const CarouselAvatars = () => {
  const { width: windowWidth } = Dimensions.get('window');

  const progress = useSharedValue<number>(0);
  const type17Player = useVideoPlayer("https://api.cogit-lab.com/documents/idle_video/47cc5e77-54dd-4c74-983b-078ea12435aa_cropped_resized_idle.mp4", player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  const ziaSofiaPlayer = useVideoPlayer("https://api.cogit-lab.com/documents/idle_video/f050269a-f64d-4dc3-b835-cef9d1a37c70_cropped_resized_idle.mp4", player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  const briatorePlayer = useVideoPlayer("https://api.cogit-lab.com/documents/idle_video/c9c8e3c7-ac0b-472b-8d7a-f84e349b25fd_cropped_resized_idle.mp4", player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  const agenticaPlayer = useVideoPlayer("https://api.cogit-lab.com/documents/idle_video/3ddba8f5-0d2c-4932-a172-09986ee12c3c_cropped_resized_idle.mp4", player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const data = [
    {
      id: 1,
      video: type17Player,
      name: 'Type17',
      description: 'Personality Typing'
    },
    {
      id: 2,
      video: ziaSofiaPlayer,
      name: 'Zia Sofia',
      description: 'Cooking teacher'
    },
    {
      id: 3,
      video: briatorePlayer,
      name: 'Briatore',
      description: 'Italian Businessman'
    },
    {
      id: 4,
      video: agenticaPlayer,
      name: 'Agentica',
      description: 'CogitAi Ai Expert'
    },
  ]

  return (
    <View>
      <Carousel
        autoPlay={true}
        autoPlayInterval={10000}
        data={data}
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
            <Box className="shadow-hard-5" key={item.id}>
              <VideoView playsInline nativeControls={false} contentFit="cover" style={{ width: windowWidth / 2, height: '90%', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(238, 130, 238, 0.3)' }} player={item.video} />
              <Text className="text-primary-900 text-lg text-center leading-tight font-bold mt-2 mb-0">{item.name}</Text>
              <Text className="text-primary-400 text-sm text-center mt-0">{item.description}</Text>
            </Box>
          );
        }}
      />
    </View>
  );
}

export default CarouselAvatars;
