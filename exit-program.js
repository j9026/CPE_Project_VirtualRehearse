import { Component } from '@wonderlandengine/api';

export class ExitProgram extends Component {
    static TypeName = 'exit-program';

    start() {
        // Get the cursor-target component from this object
        //This component lets the object detect mouse clicks or VR controller clicks.
        const cursorTarget = this.object.getComponent('cursor-target');

        //If there is no cursortarget, then the button cannot be clicked. Stop here because the exit button would not work.
        if (!cursorTarget) {
            return;
        }

        // When clicked, end program immediately
        cursorTarget.onClick.add(() => {
            this.endProgram();
        });
    }

    endProgram() {
        window.close();
    }
}