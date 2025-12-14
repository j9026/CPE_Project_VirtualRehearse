import { Component, Type } from '@wonderlandengine/api';

/**
 * Alarm component that plays a sound when the timer finishes
 * Plays for a limited duration (maximum number of seconds)
 */
export class TimerAlarmLimited extends Component {
    // Component identifier for Wonderland Engine editor
    static TypeName = 'timer-alarm';

    // Properties that appear in editor
    static Properties = {
        // Sound file to play when timer finishes
        soundFile: { type: Type.String, default: 'alarm.wav' },

        // Maximum seconds to play the alarm sound
        maxDuration: { type: Type.Float, default: 3.0 }
    };

    // Initializing the audio files before 
    init() {
        this.audio = null;       // Audio object that will play the sound
        this.timeoutId = null;   // ID for the timeout that stops the alarm
    }

    // Called when component becomes active
    start() {
        // Create audio object with the specified sound file
        this.audio = new Audio(this.soundFile);
        this.audio.volume = 1.0;          // Full volume
        this.audio.preload = 'auto';      // Allows an instance play without delay

        // When timer finishes, it will dispatch 'timer-end-alarm' event and play the sound
        window.addEventListener('timer-end-alarm', this.play.bind(this));
    }

    /**
     * Plays the alarm sound for a limited duration
     * Called when 'timer-end-alarm' event is received
     */
    play() {
        // Safety check: make sure audio object exists
        if (!this.audio) return;

        // Stop any current playback and reset to beginning
        this.audio.pause();
        this.audio.currentTime = 0;

        // Clear any existing timer
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Play the audio	
        this.audio.play()

        // timeoutId = Stop the alarm after maxDuration seconds
        // Convert seconds to milliseconds for setTimeout
        this.timeoutId = setTimeout(() => {
            if (this.audio) {
                this.audio.pause();
                this.audio.currentTime = 0;  // Reset to beginning
            }
        }, this.maxDuration * 1000);
    }