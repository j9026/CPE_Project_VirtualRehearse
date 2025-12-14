import { Component, Property } from '@wonderlandengine/api';

export class WorkingTimer extends Component {
    // This is the name that appears in Wonderland Engine editor
    static TypeName = 'timer-count';

    // These are the properties you can set in the editor
    static Properties = {
        startButton: Property.object(),      // Button to start/pause timer
        setTimeButton: Property.object(),    // Button to set time
        hourText: Property.object(),         // Text object for hours display
        minuteText: Property.object(),       // Text object for minutes display
        secondText: Property.object()        // Text object for seconds display
    };

    // This runs once when the component is created
    init() {
        this.isRunning = false;              // Track if timer is counting down
        this.remainingTime = 0;              // Start with 0 milliseconds
    }

    // This runs when the component becomes active
    start() {
        // Log which objects we received (useful for debugging)
        console.log('[TIMER] Objects received:', {
            startButton: !!this.startButton,
            setTimeButton: !!this.setTimeButton,
            hourText: !!this.hourText,
            minuteText: !!this.minuteText,
            secondText: !!this.secondText
        });

        // Set initial time to 0 (displays 00:00:00)
        this.setTime(0);

        // Set up clicks for the buttons
        this.setupButtons();
    }

    // Attach clicks to the buttons
    setupButtons() {
        // START BUTTON - toggles timer between running and paused
        if (this.startButton) {
            // Boolean for click component (if there is either cursor(VR) or click(mouse control))
            const clickComp = this.startButton.getComponent('cursor-target') ||
                this.startButton.getComponent('click-target');

            if (clickComp) {
                // When clicked, toggle the timer state (activate/deactivate)
                clickComp.onClick.add(() => {
                    this.toggleTimer();
                });
            }
        }

        // SET TIME BUTTON - gets time from control panel
        if (this.setTimeButton) {
            const clickComp = this.setTimeButton.getComponent('cursor-target') ||
                this.setTimeButton.getComponent('click-target');

            if (clickComp) {
                // When clicked, get time from external control panel
                clickComp.onClick.add(() => {
                    this.setTimeFromControlPanel();
                });
            }
        }
    }

    // Gets time from an external control panel
    setTimeFromControlPanel() {
        // Check if the control panel exists
        if (typeof window !== 'undefined' && window.timeboardController) {
            // Get the controller object
            const controller = window.timeboardController;
            // Ask the controller for the time in milliseconds
            const timeMs = controller.getTimeInMilliseconds();
            // Sets time with a given value
            this.setTime(timeMs);
        } else {
            // set to 0
            this.setTime(0);
        }
    }

    // sets the timer to a specific number of milliseconds and immediately shows it on screen.
    setTime(milliseconds) {
        this.remainingTime = milliseconds;   // Store the time
        this.isRunning = false;              // Stop timer when setting new time
        this.updateDisplay();                // Update the display immediately
    }

    // Checks if we can start the timer and start 
    toggleTimer() {
        // If we're trying to start but no time is set
        if (!this.isRunning) {
            // Call the stored time 
            this.setTimeFromControlPanel();
            // If still 0 after getting from control panel, don't start
            if (this.remainingTime <= 0) {
                return; // Exit the function early
            }
        }

        // Flip the state: running → paused, paused → running
        this.isRunning = !this.isRunning;

        // If the timer is running, record the current time for later use
        if (this.isRunning) {
            this.startTime = Date.now();
        }
    }

    // This runs every frame (60 times per second) + Counts down (Subtraction) the timer into smallest frame 
    update() {
        // Only count down if timer is running and has time left
        if (this.isRunning && this.remainingTime > 0) {
            // Calculate how much time passed since last frame
            const now = Date.now();
            const elapsed = now - this.startTime;

            // Calculate remaining time + Math.max makes sure that the value stays a positive number
            this.remainingTime = Math.max(0, this.remainingTime - elapsed);
            this.startTime = now; // Reset for next frame

            // Update the numbers on screen
            this.updateDisplay();

            // Put the current time where other components can access to
            if (typeof window !== 'undefined') {
                window.savedTimerData = this.getTimeParts();
            }

            // When timer reaches 0
            if (this.remainingTime <= 0) {
                this.isRunning = false; // Stop the timer
                // Send a message to the alarm component
                window.dispatchEvent(new Event('timer-end-alarm'));
            }
        }
    }

    // Converts milliseconds(perfect game frame size) to hours, minutes, and seconds
    getTimeParts() {
        const totalSeconds = Math.floor(this.remainingTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    }

    // Updates the text displays on screen by updating hour/minute/second
    updateDisplay() {
        const time = this.getTimeParts();

        // Update hour text (pad with leading zero: 1 → "01")
        // Checks text object → checks if it has a text component → Use the component
        if (this.hourText) {
            const hourComp = this.hourText.getComponent('text');
            if (hourComp) {
                hourComp.text = time.hours.toString().padStart(2, '0');
            }
        }

        // Update minute text
        if (this.minuteText) {
            const minuteComp = this.minuteText.getComponent('text');
            if (minuteComp) {
                minuteComp.text = time.minutes.toString().padStart(2, '0');
            }
        }

        // Update second text
        if (this.secondText) {
            const secondComp = this.secondText.getComponent('text');
            if (secondComp) {
                secondComp.text = time.seconds.toString().padStart(2, '0');
            }
        }
    }
}

