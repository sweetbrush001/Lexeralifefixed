import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from "react-native"
import LottieView from "lottie-react-native"
import * as Haptics from "expo-haptics"

const { width, height } = Dimensions.get("window")

export default function PhonicsGameSummary({
  score,
  totalQuestions,
  difficulty,
  highScore,
  onPlayAgain,
  onChangeDifficulty,
  onBackToHome,
}) {
  const percentage = Math.round((score / totalQuestions) * 100)

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

  // Get the appropriate animation based on score
  const getAnimation = () => {
    if (percentage >= 80) {
      return require("../games/assets/animations/great-treasure.json")
    } else if (percentage >= 50) {
      return require("../games/assets/animations/good-treasure.json")
    } else {
      return require("../games/assets/animations/poor-treasure.json")
    }
  }

  // Get the appropriate message based on score
  const getMessage = () => {
    if (percentage >= 80) {
      return "Ahoy! Ye found the treasure!"
    } else if (percentage >= 50) {
      return "Not bad, matey!"
    } else {
      return "Arrr! Better luck next time!"
    }
  }

  return (
    <ImageBackground source={require("../games/assets/images/Phonics/pirate-splash-bg.png")} style={styles.container}>
      <View style={styles.overlay}>
        <LottieView source={getAnimation()} autoPlay loop style={styles.animation} />

        <Text style={styles.title}>Adventure Complete!</Text>

        <ImageBackground
          source={require("../games/assets/images/Phonics/pirate-scroll.png")}
          style={styles.statsContainer}
          resizeMode="stretch"
        >
          <View style={styles.statsContent}>
            <Text style={styles.messageText}>{getMessage()}</Text>

            <Text style={styles.difficultyText}>
              {difficulty === "easy" ? "Cabin Boy" : difficulty === "medium" ? "First Mate" : "Captain"} Difficulty
            </Text>

            <Text style={styles.scoreText}>
              Score: {score}/{totalQuestions} ({percentage}%)
            </Text>

            <Text style={styles.statsText}>High Score: {highScore}</Text>
          </View>
        </ImageBackground>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePlayAgain} activeOpacity={0.7}>
            <ImageBackground
              source={require("../games/assets/images/Phonics/pirate-wood.png")}
              style={styles.woodenButton}
              resizeMode="stretch"
            >
              <Text style={styles.buttonText}>Play Again</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleChangeDifficulty} activeOpacity={0.7}>
            <ImageBackground
              source={require("../games/assets/images/Phonics/pirate-wood.png")}
              style={styles.woodenButton}
              resizeMode="stretch"
            >
              <Text style={styles.buttonText}>Change Difficulty</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleBackToHome} activeOpacity={0.7}>
            <ImageBackground
              source={require("../games/assets/images/Phonics/pirate-wood.png")}
              style={styles.woodenButton}
              resizeMode="stretch"
            >
              <Text style={styles.buttonText}>Back to Port</Text>
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
    width: width * 0.4,
    height: width * 0.3,
    marginBottom: height * 0.001,
  },
  title: {
    fontSize: Math.min(width * 0.08, 38),
    fontFamily: "OpenDyslexic-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: height * 0.01,
  },
  statsContainer: {
    width: width * 1.05,
    height: height * 0.45,
    marginVertical: height * 0.02,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContent: {
    width: "70%",
    alignItems: "center",
    padding: 20,
  },
  messageText: {
    fontSize: Math.min(width * 0.06, 24),
    fontFamily: "OpenDyslexic-Bold",
    color: "#4f270a",
    marginBottom: height * 0.015,
    textAlign: "center",
  },
  difficultyText: {
    fontSize: Math.min(width * 0.05, 22),
    fontFamily: "OpenDyslexic-Bold",
    color: "#8B4513",
    
    textAlign: "center",
  },
  scoreText: {
    fontSize: Math.min(width * 0.07, 28),
    fontFamily: "OpenDyslexic-Bold",
    color: "#8B4513",
    
    textAlign: "center",
  },
  statsText: {
    fontSize: Math.min(width * 0.05, 22),
    fontFamily: "OpenDyslexic-Bold",
    color: "#8B4513",
    
    textAlign: "center",
  },
  buttonsContainer: {
    width: "90%",
    alignItems: "center",
    gap: height * 0.001,
  },
  button: {
    width: width * 0.5,
    height: height * 0.07,
    marginBottom: height * 0.001,
  },
  woodenButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#eb9f2d",
    fontSize: Math.min(width * 0.03, 22),
    fontFamily: "OpenDyslexic-Bold",
    textAlign: "center",
    transform: [{ translateY: -2 }],
  },
})

