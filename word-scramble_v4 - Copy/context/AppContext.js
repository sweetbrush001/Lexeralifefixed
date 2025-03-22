"use client"

import { createContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [scores, setScores] = useState({
    easy: [],
    medium: [],
    hard: [],
  })

  useEffect(() => {
    // Load scores from AsyncStorage
    const loadScores = async () => {
      try {
        const easyScores = await AsyncStorage.getItem("easyScores")
        const mediumScores = await AsyncStorage.getItem("mediumScores")
        const hardScores = await AsyncStorage.getItem("hardScores")

        setScores({
          easy: easyScores ? JSON.parse(easyScores) : [],
          medium: mediumScores ? JSON.parse(mediumScores) : [],
          hard: hardScores ? JSON.parse(hardScores) : [],
        })
      } catch (error) {
        console.error("Error loading scores:", error)
      }
    }

    loadScores()
  }, [])

  // Add a new score to the scoreboard
  const addScore = async (level, playerName, score) => {
    try {
      const newScores = {
        ...scores,
        [level]: [...scores[level], { playerName, score, date: new Date().toISOString() }]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10), // Keep only top 10
      }

      setScores(newScores)

      // Save to AsyncStorage
      await AsyncStorage.setItem(`${level}Scores`, JSON.stringify(newScores[level]))
    } catch (error) {
      console.error("Error saving score:", error)
    }
  }

  // Scramble a word
  const scrambleWord = (word) => {
    const wordArray = word.split("")
    let scrambled = word

    // Make sure the scrambled word is different from the original
    while (scrambled === word) {
      for (let i = wordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]]
      }
      scrambled = wordArray.join("")
    }

    return scrambled
  }

  return <AppContext.Provider value={{ scores, addScore, scrambleWord }}>{children}</AppContext.Provider>
}

