/**
 * B"H

 */

/**
 * import data for world
 */



//import starting level

import ManagerOfAllWorlds from "./worldManager.js";

console.log("B\"H",
"\n","Starting the Ikar JS!")

try {


    ///alert("Loaded")
    var m = new ManagerOfAllWorlds('/oyvedEdom.js');
    window.mana =  m;
    console.log("Loaded!",m)
} catch(e) {
    console.log("Issue!", e)
}




















