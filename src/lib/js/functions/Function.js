import Curve from '../Curve';

export default class Function extends Curve {
    
    constructor(options) {

        super({...options});

        this.category = 'function';

        this.fn = (n) => n;

        // override parents default settings
        this.setTranslation();
        this.setScale();

    }

    setScaleY(y) {

        if(typeof y === 'number') {

            this.scale.y = y;

        } else if(this.surface.type === 'unitSquare') {

            this.scale.y = 0.5;

        } else if (this.surface.type === 'unitCircle') {

            this.scale.y = Math.sin(Math.PI * (9/8)) * -2;

        }

    }

    setScaleX(x) {

        if(typeof x === 'number') {

            this.scale.x = x;

        } else if(this.surface.type === 'unitSquare') {

            this.scale.x = 1;

        } else if (this.surface.type === 'unitCircle') {

            this.scale.x = Math.cos(Math.PI * (9/8)) * -2;

        }

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