import Curve from '../Curve';

export default class Function extends Curve {
    
    constructor(options) {

        super({...options});

        this.category = 'function';

        this._fn = (n) => n;

    }

    setScaleY(y = 0.5) {

        this.scale.y = y;

    }

    setTranslateX(translateX) {

        if(translateX !== undefined) {

            this.translation.x = translateX

        } else if(this.surface.type === 'unitSquare') {

            this.translation.x = 0;

        } else if (this.surface.type === 'unitCircle') {

            this.translation.x = Math.cos(Math.PI * (9/8));

        }

    }

    setTranslateY(translateY) {

        if(translateY !== undefined) {

            this.translation.y = translateY

        } else if(this.surface.type === 'unitSquare') {

            this.translation.y = 0.25;

        } else if (this.surface.type === 'unitCircle') {

            this.translation.y = Math.sin(Math.PI * (9/8));

        }

    }

}