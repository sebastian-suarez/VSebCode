import { M, L, C, Z, poly, circle, ellipse } from './F04-geom.mjs';
import { show } from './F04-try.mjs';
const cat=(...x)=>x.flat();
const body=[M(5,3),C(7.6,3,8.8,5.6,8.8,7.4),C(8.8,8.9,7.2,9.4,5,9.4),
            C(2.8,9.4,1.2,8.9,1.2,7.4),C(1.2,5.6,2.4,3,5,3),Z];
const feet=cat(poly([[1,9.9],[4.6,8.4],[4.6,9.9]]),poly([[9,9.9],[5.4,8.4],[5.4,9.9]]));
show([
 {name:'current (no beak)', ops:cat(feet,circle(5,2.2,2),body,ellipse(5,6.4,2.1,1.8,-1))},
 {name:'beak right', ops:cat(feet,circle(5,2.2,2),poly([[5.4,2.2],[8.1,3.1],[5.4,3.9]]),body,ellipse(5,6.4,2.1,1.8,-1))},
 {name:'beak + narrower belly', ops:cat(feet,circle(5,2.2,2),poly([[5.4,2.2],[8.1,3.1],[5.4,3.9]]),body,ellipse(5,6.6,1.8,1.9,-1))},
 {name:'beak, no belly, flippers', ops:cat(feet,circle(5,2.2,2),poly([[5.4,2.2],[8.1,3.1],[5.4,3.9]]),body,
   ellipse(1.9,6.6,.9,2.1,-1), ellipse(8.1,6.6,.9,2.1,-1))}
]);
