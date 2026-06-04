/* 
* CTRule : rule for Time adjustment
*/
export default class CTRule {
    constructor(name, duration) {
        this.id = new Date().getTime();
        this.name = name;
        this.duration = duration;
    }
}