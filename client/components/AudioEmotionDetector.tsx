'use client'

import { useState, useRef } from 'react'
import { Upload, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Emotion = 'happy' | 'sad' | 'angry' | 'neutral' | 'excited' | 'fearful'

const emotionData: Record<Emotion, { emoji: string; title: string }> = {
  happy: { emoji: '😊', title: 'Happy' },
  sad: { emoji: '😢', title: 'Sad' },
  angry: { emoji: '😠', title: 'Angry' },
  neutral: { emoji: '😐', title: 'Neutral' },
  excited: { emoji: '😃', title: 'Excited' },
  fearful: { emoji: '😨', title: 'Fearful' }
}

export default function AudioEmotionDetector() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [emotion, setEmotion] = useState<Emotion | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setEmotion(null)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(error => console.error('Audio playback failed:', error))
      }
      setIsPlaying(!isPlaying)
    }
  }
  const detectEmotion = async () => {
    if (!audioFile) return

    const formData = new FormData()
    formData.append('file', audioFile)

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      const detectedEmotion: Emotion = data.predicted_emotion.toLowerCase()
      setEmotion(detectedEmotion)
    } catch (error) {
      console.error('Error detecting emotion:', error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Audio Emotion Detector</h1>
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <label htmlFor="audio-upload" className="cursor-pointer">
              <div className="bg-blue-500 text-white rounded-full p-4 hover:bg-blue-600 transition-colors">
                <Upload size={24} />
              </div>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          {audioFile && (
            <div className="space-y-4">
              <p className="text-center">{audioFile.name}</p>
              <audio 
                ref={audioRef} 
                src={URL.createObjectURL(audioFile)} 
                onEnded={() => setIsPlaying(false)}
                controls 
                className="w-full mt-4"
              />
              <div className="flex justify-center">
                <Button onClick={detectEmotion} className="bg-green-500 hover:bg-green-600">
                  <Send size={18} className="mr-2" />
                  Detect Emotion
                </Button>
              </div>
            </div>
          )}
          {emotion && (
            <div className="text-center space-y-2">
              <div className="text-6xl">{emotionData[emotion].emoji}</div>
              <h2 className="text-xl font-semibold">{emotionData[emotion].title}</h2>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

