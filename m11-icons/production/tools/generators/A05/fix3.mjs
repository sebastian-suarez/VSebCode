// fix3.mjs — ng-tailwind: the curved ribbon kept dissolving; straight-segment wave, 2.8 px band.
import { write } from './a05lib.mjs';
const wave = (dx, dy) => {
	const P = [[1.4, 6.6], [4, 3.6], [7, 3.6], [9.4, 6], [11.4, 6], [13, 4.6],
	[13, 7.4], [11.4, 8.8], [9.4, 8.8], [7, 6.4], [4, 6.4], [1.4, 9.4]];
	return 'M' + P.map(p => `${p[0] + dx} ${p[1] + dy}`).join('L') + 'Z';
};
console.log('ng-tailwind', write('ng-tailwind', `<path fill="#C8556F" d="${wave(0, 0)}${wave(1.4, 4.4)}"/>`));
