import GameScene from './scenes/game.js';
import LoseScene from './scenes/lose.js';
import WinScene from './scenes/win.js';
import MenuScene from './scenes/menu.js';

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: "#D48A9E",
    physics: {
        default: 'matter',
        matter: { gravity: { y: 0.7 }, debug: false }
    },
    scene: [MenuScene, GameScene, LoseScene, WinScene]
};

new Phaser.Game(config);


