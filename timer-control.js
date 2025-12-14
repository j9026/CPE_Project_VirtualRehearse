import { Component, Type } from '@wonderlandengine/api';
//main class for controlling the timeboard UI
export class TimeboardController extends Component {
    static TypeName = 'timer-control';

    static Properties = {
        //Buttons for + and - for hours, minutes, and seconds
        hourPlus: { type: Type.Object },
        hourMinus: { type: Type.Object },
        minutePlus: { type: Type.Object },
        minuteMinus: { type: Type.Object },
        secondPlus: { type: Type.Object },
        secondMinus: { type: Type.Object },

        //Text objects that actually show the numbers on the screen
        hourTextObj: { type: Type.Object },
        minuteTextObj: { type: Type.Object },
        secondTextObj: { type: Type.Object },

        //Default starting values for the timer
        initialHours: { type: Type.Int, default: 0 },
        initialMinutes: { type: Type.Int, default: 0 },
        initialSeconds: { type: Type.Int, default: 0 },

        //Options like max hours and whether values should wrap around
        maxHours: { type: Type.Int, default: 99 },
        wrapValues: { type: Type.Bool, default: true },

        //Step sizes for buttons that move minutes/seconds by more than 1
        minuteStep: { type: Type.Int, default: 1 },   // changes by 1 minute at a time
        secondStep: { type: Type.Int, default: 1 },   // changes by 1 second at a time
    };

    start() {
        //Load initial values into internal variables
        this.h = this.initialHours | 0;
        this.m = this.initialMinutes | 0;
        this.s = this.initialSeconds | 0;

        //Grab the actual text components so the display can update
        this.hourText = this._getText(this.hourTextObj, 'hourTextObj');
        this.minuteText = this._getText(this.minuteTextObj, 'minuteTextObj');
        this.secondText = this._getText(this.secondTextObj, 'secondTextObj');

        //Make the buttons actually do something when clicked
        this._bindClick(this.hourPlus, () => this._changeHour(+1));
        this._bindClick(this.hourMinus, () => this._changeHour(-1));
        this._bindClick(this.minutePlus, () => this._changeMinute(+1));
        this._bindClick(this.minuteMinus, () => this._changeMinute(-1));
        this._bindClick(this.secondPlus, () => this._changeSecond(+1));
        this._bindClick(this.secondMinus, () => this._changeSecond(-1));

        // Make sure that displayed numbers match the initial values
        this._updateText();

        // Expose this object globally so other elements (like WorkingTimer) can use it.
        if (typeof window !== 'undefined') {
            window.timeboardController = this;
        }
    }

    //Returns the text component of an object
    _getText(obj, name) {
        if (!obj) {
            return null;
        }
        const t = obj.getComponent('text');
        if (!t) return null;
        return t;
    }
    //connect button clicks to functions
    _bindClick(obj, callback) {
        if (!obj) {
            return;
        }
        const target = obj.getComponent('cursor-target');
        if (!target) {
            return;
        }
        target.onClick.add(callback);
    }

    //functions that handle changing values and dealing with cascading
    _changeHour(amount) {
        this._applyHourDelta(amount);
        this._updateText();
    }

    _changeMinute(amount) {
        const inc = amount * this.minuteStep;
        this._addMinutes(inc);
        this._updateText();
    }

    _changeSecond(amount) {
        //convert button press into actual second change
        const inc = amount * this.secondStep;

        //add seconds to the current value
        let total = this.s + inc;

        //store how many whole minutes we need to add/subtract
        let minuteCarry = 0;
        //If seconds overflow or underflow, calculate how many whole minutes were crossed
        if (total >= 60 || total < 0) {
            minuteCarry = Math.floor(total / 60);
            this.s = ((total % 60) + 60) % 60;  // keeps second between 0-59
        } else {
            //when there is no overflow/underflow, use total seconds directly.
            this.s = total;
        }

        //If one or more minutes were crossed, apply them to minutes
        if (minuteCarry !== 0) this._addMinutes(minuteCarry);
        this._updateText(); // update the display
    }

    //adds minutes and handles hour carry
    _addMinutes(deltaMinutes) {
        //add the minutes change to the current value
        let total = this.m + deltaMinutes;

        //Track how many whole hours we need to add/subtract
        let hourCarry = 0;
        //detct overflow/underflow
        if (total >= 60 || total < 0) {
            hourCarry = Math.floor(total / 60);
            this.m = ((total % 60) + 60) % 60;  // The extra "+60" fixes negative modulo results (JS % can be negative).             
        } else {
            this.m = total;
        }

        //if hours need to be updated, apply that change
        if (hourCarry !== 0) this._applyHourDelta(hourCarry);
    }

    //Updates hour value with optional wrapping behavior
    //hours loop around (99->0)
    _applyHourDelta(d) {
        if (this.wrapValues) {
            const range = this.maxHours + 1;
            this.h = (((this.h + d) % range) + range) % range;
        } else {
            this.h = Math.max(0, Math.min(this.maxHours, this.h + d));
        }
    }

    //Actually update the text on the screen
    _updateText() {
        if (this.hourText) this.hourText.text = this.h.toString().padStart(2, '0');
        if (this.minuteText) this.minuteText.text = this.m.toString().padStart(2, '0');
        if (this.secondText) this.secondText.text = this.s.toString().padStart(2, '0');
    }

    // Returns the total time in ms
    getTimeInMilliseconds() {
        return (this.h * 3600 + this.m * 60 + this.s) * 1000;
    }

    // Returns the time as an object
    getTimeParts() {
        return {
            hours: this.h,
            minutes: this.m,
            seconds: this.s
        };
    }
}