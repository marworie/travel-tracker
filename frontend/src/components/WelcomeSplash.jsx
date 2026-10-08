import Lottie from 'lottie-react'
import welcome from '../assets/welcome.json'

export default function WelcomeSplash({ username, onDone }) {
  return (
    <div className="splash">
      <Lottie animationData={welcome} loop={false} onComplete={onDone} className="splash-lottie" />
      <p className="splash-text">Hoş geldin, <strong>{username}</strong></p>
    </div>
  )
}