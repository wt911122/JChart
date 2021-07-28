import { EasingFunctions } from './easing';

export function makeRenderCallback(renderFunc) {
    let d = null;
    return function() {
        if(!d) {
            d = renderFunc;
            requestAnimationFrame(() => {
                d();
                d = null;
            });
        }
    };
}

function animate({
    easingFunc,
    duration,
    fps,
    renderCallback,
}, callback) {
    let start;
    let elapsed;
    let lastFrame = 0;
    const interval = 1000 / fps;
    let animationId = null;
    function step(timestamp) {
        
        if (start === undefined) {
            start = timestamp;
        }
        elapsed = timestamp - start;
        if(timestamp - lastFrame < interval) {
            animationId = requestAnimationFrame(step);
            return;
        }
        const ratio = easingFunc(elapsed / duration);
        if (ratio >= 1) {
            callback('end');
        } else {
            callback(ratio);
            animationId = requestAnimationFrame(step);
        } 
        renderCallback();

        lastFrame = timestamp;
    }
    animationId = requestAnimationFrame(step);
    
    
    return {
        stop() {
            cancelAnimationFrame(animationId);
        },
    };
}

function defaultOnNumberElement(newState, oldState, idx, ratio, currentArray) {
    if(ratio === 'end') {
        currentArray[idx] = newState;
    } else {
        currentArray[idx] = oldState + (oldState-newState) * ratio;
    }
}

export class AnimeArray {
    constructor({
        startArray = [],
        defaultNumber = 0,
        easingFunc = 'easeInQuad',
        fps = 60,
        duration,
        key,
        callbackOnElement = defaultOnNumberElement,
        callBackOnMakeUp = function(v) {return v;},
        renderCallback,
    }) {
        this.__array = startArray; 
        this.defaultNumber = defaultNumber;
        this.animeOptions = {
            easingFunc: EasingFunctions[easingFunc],
            fps, duration,
            renderCallback
        };
        this.__anime = null;
        this.key = key;
        this.callbackOnElement = callbackOnElement;
        this.callBackOnMakeUp = callBackOnMakeUp;
    }
    get value(){
        return this.__array;
    }

    animeTo(newArray) {
        if(this.__anime) {
            this.__anime.stop();
        }
        // let uselessArray = null;
        let sliceLength = null;
        if(this.key) {   
            const k = this.key;
            const p = [];
            newArray.forEach(elem => {
                const finded = this.__array.find(__elem => __elem[k] === elem[k]);
                if(finded) {
                    p.push(finded);
                }else {
                    p.push(elem);
                }
            });
            this.__array = p;
        } else {
            const callBackOnMakeUp = this.callBackOnMakeUp;
            const span = newArray.length - this.__array.length;
            
            if(span > 0) {
                const ratio = this.__array.length > 0 ? newArray.length / this.__array.length : 0;
                const makeup = newArray.slice(this.__array.length);
                this.__array = this.__array.concat(callBackOnMakeUp(makeup, ratio, newArray[0]));
            }

            if(span < 0) {
                const ratio = newArray.length > 0 ? this.__array.length / newArray.length : 0;
                sliceLength = newArray.length;
                newArray = newArray.concat(callBackOnMakeUp(this.__array.slice(newArray.length), ratio, this.__array[0]));
            }
        }
        
        const beginState = this.__array.slice();
        const callbackOnElement = this.callbackOnElement;
        this.__anime = animate(this.animeOptions, (ratio) => {
            let i = 0;
            const l = this.__array.length;
            for(;i < l; i++) {
                callbackOnElement(newArray[i], beginState[i], i, ratio, this.__array);
            }
            if(ratio === 'end') {
                if(sliceLength) {
                    this.__array = this.__array.slice(0, sliceLength);
                }
            }
            
        });
    }
}

export class AnimeNumber {
    constructor({
        startNumber = 0,
        easingFunc = 'easeInQuad',
        fps = 60,
        duration,
        renderCallback
    }) {
        // [number, number ....]
        this.__number = startNumber; 
        this.animeOptions = {
            easingFunc: EasingFunctions[easingFunc],
            fps, duration,
            renderCallback
        };
        this.__anime = null;
    }

    get value(){
        return this.__number;
    }

    animeTo(newNumber) {
        if(this.__anime) {
            this.__anime.stop();
        }

        if(newNumber === this.__number) return;

        const span = newNumber - this.__number;
        const lastNumber = this.__number;
        this.__anime = animate(this.animeOptions, (ratio) => {
            if(ratio === 'end') {
                this.__number = newNumber;
            } else {
                this.__number = lastNumber + span * ratio;
            }
        });
    }
}
