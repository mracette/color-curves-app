import { Arc } from '../../js/Arc';

test('arc angle never exceeds 2PI', () => {

    let arc = new Arc(0, 0, 1, 0, Math.PI * 1.9, 0, false);
    arc.adjustAngleStart(-0.5 * Math.PI);
    expect(arc.angleEnd - arc.angleStart).toBeLessThanOrEqual(Math.PI * 2);

});

test('arc angle never exceeds 2PI', () => {

    let arc = new Arc(0, 0, 1, 0, 0, 823918, false);
    arc.adjustAngleStart(253 * Math.PI);
    expect(arc.angleEnd - arc.angleStart).toBeLessThanOrEqual(Math.PI * 2);

});

test('arc angle never exceeds 2PI', () => {

    let arc = new Arc(5, 5, 1, 0, Math.PI / 2, -3 * Math.PI / 2.1, false);
    arc.set(-Math.PI / 4);
    expect(arc.angleEnd - arc.angleStart).toBeLessThanOrEqual(Math.PI * 2);

});

test('arc angle never exceeds 2PI', () => {

    let arc = new Arc(5, 5, 1, 0, 0, 232, false);
    arc.adjustAngleEnd(14 * Math.PI);
    expect(arc.angleEnd - arc.angleStart).toBeLessThanOrEqual(Math.PI * 2);

});