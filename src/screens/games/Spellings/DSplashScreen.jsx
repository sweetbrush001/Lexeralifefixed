"use client"

import React, { useEffect, useState } from "react"
import styled, { keyframes } from "styled-components"
import { Animated, Easing } from "react-native"

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const SplashContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff; /* Adjust as needed */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: ${fadeIn} 0.5s ease-in-out forwards;

  &.fade-out {
    animation: ${fadeOut} 0.5s ease-in-out forwards;
  }
`

const Logo = styled.img`
  width: 200px; /* Adjust as needed */
  height: auto;
`

const DSplashScreen = ({ logoSrc, duration = 2000, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [fadeOutClass, setFadeOutClass] = useState("")
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0)).current

  const onFinish = () => {
    setFadeOutClass("fade-out")
    setTimeout(() => {
      setIsVisible(false)
      if (onComplete) {
        onComplete()
      }
    }, 500)
  }

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.elastic(1),
        useNativeDriver: false,
      }),
    ]).start()

    // Navigate to next screen after delay
    const timer = setTimeout(() => {
      onFinish()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <SplashContainer className={fadeOutClass}>
      <Logo src={logoSrc} alt="Logo" />
    </SplashContainer>
  )
}

export default DSplashScreen
export { DSplashScreen }
export { default as DSplashScreen } from "./DSplashScreen"