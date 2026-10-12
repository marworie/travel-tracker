import Lottie from 'lottie-react'
import welcome from '../assets/welcome.json'
import {useRef} from 'react'

export default function WelcomeSplash({ username, onDone }) {
  const lottieRef = useRef(null)
  return (
    <div className="splash">
      <Lottie 
        lottieRef={lottieRef}
        onDOMLoaded={() => lottieRef.current.setSpeed(5)}
        animationData={welcome} 
        loop={false} 
        onComplete={onDone} 
        className="splash-lottie" 
      />
      <p className="splash-text">Hoş geldin, <strong>{username}</strong></p>
    </div>
  )
}