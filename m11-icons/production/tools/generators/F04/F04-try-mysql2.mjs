import { M, L, C, Z, poly, ellipse, A } from './F04-geom.mjs';
import { show } from './F04-try.mjs';
const F='#4479A1';
const cat=(...x)=>x.flat();
show([
 {name:'E slim body, detached fin', fill:F, ops:cat(
   [M(.2,6.8), C(.8,4.6,3,3.4,5.8,3.6), C(7.4,3.8,8.4,4.6,8.6,5.6),
    L(9.9,5.4), L(9.5,9.3), L(7.8,7), C(6,8,2.6,8.2,.2,6.8), Z],
   poly([[4.4,3.3],[5.8,.6],[7,3.5]]))},
 {name:'F slimmer, drop snout', fill:F, ops:cat(
   [M(.3,8.2), C(.3,5.4,2.6,3.8,5.6,4), C(7.2,4.1,8.3,4.9,8.6,5.9),
    L(9.9,5.6), L(9.6,9.5), L(7.7,7.3), C(5.8,8.6,2.2,9,.3,8.2), Z],
   poly([[4.2,3.8],[5.6,1],[6.9,4]]))},
 {name:'G three stacked discs', fill:F, ops:cat(
   ellipse(5,1.9,4.4,1.7), ellipse(5,5,4.4,1.7), ellipse(5,8.1,4.4,1.7))},
 {name:'H cylinder, tri-band', fill:F, rule:'evenodd', ops:cat(
   [M(.7,2.4),A(4.3,2.2,0,0,9.3,2.4),L(9.3,7.6),A(4.3,2.2,0,1,.7,7.6),Z],
   [M(.7,2.4),A(4.3,2.2,0,1,9.3,2.4),L(9.3,3.7),A(4.3,2.2,0,1,.7,3.7),Z])}
]);
