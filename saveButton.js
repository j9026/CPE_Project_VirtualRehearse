import { Component, Type } from '@wonderlandengine/api';

export class TimerSave extends Component {
    static TypeName = 'save-button';

    static Properties = {
        // these objects contain the on-screen text components that displays hour, minute, and second
        hourTextObj: { type: Type.Object },
        minuteTextObj: { type: Type.Object },
        secondTextObj: { type: Type.Object },

        //the root object of the timer UI, so we can hide everything once saved.
        timerBoard: { type: Type.Object },   // root object to hide

        //Key name for saving to browser storage(localStorage)
        storageKey: { type: Type.String, default: 'timerSaved' }
    };

    start() {
        // Get a click handler so the save-button reacts when pressed
        const ct = this.object.getComponent('cursor-target');

        //If the button is clickable, connect the click to the save-and-hide function.
        if (ct) ct.onClick.add(() => this._saveAndHide());
    }

    _saveAndHide() {
        //Read the numbers from the text components.
        //_read() converts the text into a real number (0 if missing/invalid)
        const h = this._read(this.hourTextObj);
        const m = this._read(this.minuteTextObj);
        const s = this._read(this.secondTextObj);

        //Create a simple object representing the current timer state.
        const payload = { hours: h, minutes: m, seconds: s };

        // Store globally for other scripts can access the saved values
        window.savedTimerData = payload;

        // Save the timer state in localStorage so it persists even after -> local storage: built-in database that keeps data.
        //JSON.stringify converts the object into a string so localStorage can store it.
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(payload));
        } catch (e) {
            //saving may fail in private mode or if the storage is blocked. do nothing here for a silent failure to keep the program running.
        }

        // Hide the entire timer UI and its children inside it.
        if (this.timerBoard) this._setRecursiveActive(this.timerBoard, false);
    }

    _read(obj) {
        //If the object doesn't exist, return 0 to avoid errors.
        if (!obj) return 0;
        const t = obj.getComponent('text'); // grab the text component from the object
        if (!t) return 0; // no text component, can't get a number -> return 0.
        const n = parseInt(t.text); // convert the displayed string (like 05) into number (5)
        return isNaN(n) ? 0 : n; // If text is not a valid number, return 0 to avoid NaN problems.
    }

    _setRecursiveActive(obj, active) {
        obj.active = active; // turn this object on/off by setting its active state
        //recursively apply the same active state to all children. Ensuring the entire timer UI disappears at once.
        const kids = obj.children;
        for (let i = 0; i < kids.length; i++) {
            this._setRecursiveActive(kids[i], active);
        }
    }
}