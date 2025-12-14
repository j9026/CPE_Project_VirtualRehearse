import { Component, Property } from '@wonderlandengine/api';

export class TeleportButton extends Component {
    static TypeName = 'teleport';
    static Properties = {
        player: Property.object(), // the player object (or camera)
        target: Property.object(), // the teleport destination object made with Empty
    };

    start() {
        // Find the cursor target on this button
        const target = this.object.getComponent('cursor-target');
        if (target) {
            target.onClick.add(this.teleportPlayer.bind(this)); // bind to fix thisTeleportPlayer
        }
    }

    teleportPlayer() {
        if (!this.player || !this.target) {
            console.log('no player/target');
            return;
        }

        // Get the teleport destination position using Float32Array fucntion
        // Instead of using the regular const pos = [0,0,0], using this function creates an optimized 3D matrix 
        // Faster calculation 3D calculations

        const pos = new Float32Array(3); // seting teleport position a constant

        // checks where "this.target" object is
        // put (x, y, z) coordinates into the "pos" array
        // set result to pos = [targetX, targetY, targetZ]
        this.target.getTranslationWorld(pos);

        // Move the player to that position by taking the coordinates FROM the 'pos' array
        this.player.setTranslationWorld(pos);

    }
}
