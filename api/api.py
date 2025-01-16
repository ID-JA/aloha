from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
import joblib
import tensorflow as tf
import os

model = tf.keras.models.load_model("aloha_emotion_classifier_model.h5")
scaler = joblib.load("scaler.pkl")
label_encoder = joblib.load("label_encoder.pkl")

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"])

def extract_features(audio_file):
    audio, sample_rate = librosa.load(audio_file, sr=None)
    mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=13)
    chroma = librosa.feature.chroma_stft(y=audio, sr=sample_rate)
    spectral_contrast = librosa.feature.spectral_contrast(y=audio, sr=sample_rate)
    return np.hstack([mfccs.mean(axis=1), chroma.mean(axis=1), spectral_contrast.mean(axis=1)])

def predict_emotion(audio_file_path):
    features = extract_features(audio_file_path)
    
    features = scaler.transform([features])
    
    predicted_class = np.argmax(model.predict(features), axis=1)
    
    predicted_label = label_encoder.inverse_transform(predicted_class)
    
    return predicted_label[0]

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    file_path = os.path.join('temp_audio', file.filename)
    os.makedirs('temp_audio', exist_ok=True)
    file.save(file_path)

    try:
        emotion = predict_emotion(file_path)
        return jsonify({'predicted_emotion': emotion})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(file_path)

if __name__ == '__main__':
    app.run(debug=True)
