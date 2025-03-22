import { useContext, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ImageBackground } from "react-native";
import { AppContext } from "../context/AppContext";

const ScoreboardScreen = ({ navigation }) => {
  const { scores } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("easy");

  // Format date for display in dd/mm/yy format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Render a score item
  const renderScoreItem = ({ item, index }) => (
    <View style={styles.scoreItem}>
      <Text style={styles.rankText}>{index + 1}</Text>
      <Text style={styles.nameText}>{item.username}</Text> {/* Use `username` or `email` */}
      <Text style={styles.scoreValueText}>{item.score}</Text>
      <Text style={styles.dateText}>{formatDate(item.date)}</Text>
    </View>
  );

  // Render empty state
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No scores yet for this level.</Text>
      <Text style={styles.emptySubText}>Be the first to play!</Text>
    </View>
  );

  return (
    <ImageBackground source={require("../assets/images/scoreboard-background.png")} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Top Scores</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "easy" && styles.activeTab]}
            onPress={() => setActiveTab("easy")}
          >
            <Text style={[styles.tabText, activeTab === "easy" && styles.activeTabText]}>Easy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "medium" && styles.activeTab]}
            onPress={() => setActiveTab("medium")}
          >
            <Text style={[styles.tabText, activeTab === "medium" && styles.activeTabText]}>Medium</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "hard" && styles.activeTab]}
            onPress={() => setActiveTab("hard")}
          >
            <Text style={[styles.tabText, activeTab === "hard" && styles.activeTabText]}>Hard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sheenBackground}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, styles.rankHeader]}>Rank</Text>
            <Text style={[styles.headerText, styles.nameHeader]}>User</Text> {/* Updated header */}
            <Text style={[styles.headerText, styles.scoreHeader]}>Score</Text>
            <Text style={[styles.headerText, styles.dateHeader]}>Date</Text>
          </View>

          <FlatList
            data={scores[activeTab]}
            renderItem={renderScoreItem}
            keyExtractor={(item, index) => `${activeTab}-${index}`}
            ListEmptyComponent={renderEmptyList}
            style={styles.list}
          />
        </View>

        <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.playButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 28,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "pale white",
    borderWidth: 1,
    borderColor: "#BDBDBD",
  },
  activeTab: {
    backgroundColor: "#6A24FE",
  },
  tabText: {
    fontFamily: "OpenDyslexic",
    fontSize: 15,
    color: "#333",
  },
  activeTabText: {
    color: "white",
    fontFamily: "OpenDyslexic-Bold",
  },
  sheenBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent white background
    borderRadius: 10,
    padding: 10,
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#6A24FE",
    marginBottom: 10,
  },
  headerText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 16,
    color: "#333",
  },
  rankHeader: {
    flex: 2, // Adjusted flex value
  },
  nameHeader: {
    flex: 3,
  },
  scoreHeader: {
    flex: 2,
    textAlign: "center",
  },
  dateHeader: {
    flex: 2,
    textAlign: "right",
  },
  list: {
    flex: 1,
  },
  scoreItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  rankText: {
    flex: 2, 
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 16,
    color: "#E6E6FA",
  },
  nameText: {
    flex: 3,
    fontFamily: "OpenDyslexic",
    fontSize: 16,
    color: "#333",
  },
  scoreValueText: {
    flex: 2,
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 16,
    color: "#301934",
    textAlign: "center",
  },
  dateText: {
    flex: 2,
    fontFamily: "OpenDyslexic",
    fontSize: 13,
    color: "#E6E6FA",
    textAlign: "right",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "OpenDyslexic",
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubText: {
    fontFamily: "OpenDyslexic",
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  playButton: {
    backgroundColor: "#6A24FE",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  playButtonText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 18,
    color: "white",
  },
});

export default ScoreboardScreen;