// src/utils/voice.ts

/**
 * Simple wrapper around the Web Speech API for voice command input.
 * Provides init, start, stop functions and parses spoken text into a command string.
 */

export type VoiceRecognizer = {
  start: () => void;
  stop: () => void;
  isListening: boolean;
};

export function createVoiceRecognizer(onResult: (transcript: string) => void): VoiceRecognizer {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Web Speech API not supported in this browser');
    return { start: () => {}, stop: () => {}, isListening: false };
  }

  const recognizer = new SpeechRecognition();
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = 'en-US';

  let listening = false;

  recognizer.onresult = (event: any) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(' ')
      .trim();
    if (transcript) {
      onResult(transcript);
    }
  };

  recognizer.onerror = (e: any) => {
    console.error('Speech recognition error', e);
    stop();
  };

  const start = () => {
    if (!listening) {
      try {
        recognizer.start();
        listening = true;
        console.log('Voice listening started');
      } catch (err) {
        console.error('Failed to start voice recognizer', err);
      }
    }
  };

  const stop = () => {
    if (listening) {
      recognizer.stop();
      listening = false;
      console.log('Voice listening stopped');
    }
  };

  return { start, stop, get isListening() { return listening; } };
}
