import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from "react-native"
import LottieView from "lottie-react-native"
import * as Haptics from "expo-haptics"

const { width, height } = Dimensions.get("window")

export default function GameSummary({
  score,
  totalWords,
  skippedWords,
  difficulty,
  highScore,
  onPlayAgain,
  onChangeDifficulty,
  onBackToHome,
}) {
  const percentage = Math.round((score / totalWords) * 100)

  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPlayAgain()
  }

  const handleChangeDifficulty = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onChangeDifficulty()
  }

  const handleBackToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onBackToHome()
  }

  return (
    <ImageBackground source={require("../../screens/games/assets/images/jungle-background.jpg")} style={styles.container}>
      <View style={styles.overlay}>
        <LottieView
          source={
            percentage >= 80
              ? require("../../screens/games/assets/animations/great-score.json")
              : percentage >= 50
                ? require("../../screens/games/assets/animations/good-score.json")
                : require("../../screens/games/assets/animations/try-again.json")
          }
          autoPlay
          loop
          style={styles.animation}
        />

        <Text style={styles.title}>Game Summary</Text>

        <ImageBackground
          source={require("../../screens/games/assets/images/wooden-panel.png")}
          style={styles.statsContainer}
          resizeMode="stretch"
        >
          <View style={styles.statsContent}>
            <Text style={styles.difficultyText}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode</Text>

            <Text style={styles.scoreText}>
              Score: {score}/{totalWords} ({percentage}%)
            </Text>

            <Text style={styles.statsText}>High Score: {highScore}</Text>

            <Text style={styles.statsText}>Words Skipped: {skippedWords}</Text>
          </View>
        </ImageBackground>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePlayAgain}>
            <ImageBackground
              source={require("../../screens/games/assets/images/wooden-button-small.png")}
              style={styles.woodenButton}
              resizeMode="stretch"
            >
              <Text style={styles.buttonText}>Play Again</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleChangeDifficulty}>
            <ImageBackground
              source={require("../../screens/games/assets/images/wooden-button-small.png")}
              style={styles.woodenButton}
              resizeMode="stretch"
            >
              <Text style={styles.buttonText}>Change Difficulty</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleBackToHome}>
            <ImageBackground
              source={require("../../screens/games/assets/images/wooden-button-small.png")}
              style={styles.woodenButton}
              resizeMode="stretch"
            >
              <Text style={styles.buttonText}>Back to Games</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  animation: {
    width: Math.min(width * 0.5, 300),
    height: Math.min(width * 0.5, 300),
    marginBottom: -50,

  },
  title: {
    fontSize: Math.min(width * 0.08, 32),
    fontFamily: "OpenDyslexic-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,

  },
  statsContainer: {
    width: Math.min(width * 0.9, 400),
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContent: {
    width: "90%",
    alignItems: "center",
  },
  difficultyText: {
    fontSize: Math.min(width * 0.06, 18),
    fontFamily: "OpenDyslexic-Bold",
    color: "#291103",
    textAlign: "center",
    marginTop: 70,
    
  },
  scoreText: {
    fontSize: Math.min(width * 0.07, 22),
    fontFamily: "OpenDyslexic-Bold",
    color: "#291103",
    marginBottom: 10,
    textAlign: "center",
  },
  statsText: {
    fontSize: Math.min(width * 0.05, 20),
    fontFamily: "OpenDyslexic-Bold",
    color: "#421c07",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "75%",
    maxWidth: Math.min(width * 0.9, 400),
    alignItems: "center",
    gap: 5,
  },
  button: {
    width: "80%",
    height: Math.min(height * 0.08, 70),
    
  },
  woodenButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#3E2723",
    fontSize: Math.min(width * 0.05, 16),
    fontFamily: "OpenDyslexic-Bold",
    textAlign: "center",
  },
})

