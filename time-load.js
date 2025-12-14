import { Component, Property } from '@wonderlandengine/api';

/**
 * TimerMirror
 * - On the second screen, automatically mirrors whatever is in window.savedTimerData
 * - Updates every frame, no button needed
 */
export class TimerMirror extends Component {
    static TypeName = 'time-load';

    static Properties = {
        hourTextObj: Property.object(),
        minuteTextObj: Property.object(),
        secondTextObj: Property.object()
    };

    start() {
        this.hourText = this._getText(this.hourTextObj, 'hourTextObj');
        this.minuteText = this._getText(this.minuteTextObj, 'minuteTextObj');
        this.secondText = this._getText(this.secondTextObj, 'secondTextObj');

        // Remember last applied values so we don't update unnecessarily
        this._lastH = null;
        this._lastM = null;
        this._lastS = null;
    }

    _getText(obj) {
        const t = obj.getComponent('text'); // get text mesh of hr,min,sec
        return t;
    }

    update(dt) {
        // No global data yet -> nothing to mirror
        if (!window.savedTimerData) return;

        const data = window.savedTimerData;
        const h = (data.hours || 0) | 0;
        const m = (data.minutes || 0) | 0;
        const s = (data.seconds || 0) | 0;

        // If nothing changed, skip
        if (h === this._lastH && m === this._lastM && s === this._lastS) return;

        this._lastH = h;
        this._lastM = m;
        this._lastS = s;

        if (this.hourText) this.hourText.text = h.toString().padStart(2, '0');
        if (this.minuteText) this.minuteText.text = m.toString().padStart(2, '0');
        if (this.secondText) this.secondText.text = s.toString().padStart(2, '0');
    }
}