import { Component, Property } from '@wonderlandengine/api';

/**
 * Timer Popup Component
 * 
 * Shows/hides the entire timer interface when clicked
 * Manages visibility of the timer board and all its child objects
 */
export class TimerPopup extends Component {
    // Component identifier for Wonderland Engine editor
    static TypeName = 'timer-toggle';

    // Properties that appear in editor
    static Properties = {
        // The main timer board object (parent of all timer UI elements)
        timerBoard: Property.object(),
    };

    /**
     * Called when component becomes active
     * Sets up initial state and click listener
     */
    start() {
        // Hide the entire timer board and all its children at start
        if (this.timerBoard) {
            this._setActiveRecursive(this.timerBoard, false);
        }

        // Attach click listener to this object
        // When clicked, shows/hides the timer board
        const target = this.object.getComponent('cursor-target');
        if (target) {
            target.onClick.add(this.toggleTimerBoard.bind(this));
        }
    }

    /**
     * Toggles the timer board visibility when clicked
     * Shows it if hidden, hides it if shown
     */
    toggleTimerBoard() {
        // Safety check: make sure timer board exists
        if (!this.timerBoard) return;

        // Calculate new state (opposite of current)
        const newState = !this.timerBoard.active;

        // Apply the state to timer board and all children
        this._setActiveRecursive(this.timerBoard, newState);
    }

    /**
     * Recursively sets active state for an object and all its children
     * In Wonderland Engine, when a parent object is set to active=false,
     * its children may still be considered "active" internally.
     * This method ensures all children are properly deactivated.
     */
    _setActiveRecursive(object, active) {
        // Set active state for this object
        object.active = active;

        // Get all direct children of this object
        const children = object.children;

        // Recursively apply to all children
        for (let i = 0; i < children.length; i++) {
            this._setActiveRecursive(children[i], active);
        }
    }
}