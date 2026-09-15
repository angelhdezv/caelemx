const ns = "http://www.w3.org/2000/svg";
function svgNode(tag, attrs = {}) {
 const node = document.createElementNS(ns, tag);
 for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
 return node;
}
// Each stem has its own pivot, phase and amplitude; all complete a cycle in 3s.
export function bouquet(variant = "meadow", className = "") {
 const svg = svgNode("svg", {viewBox:"0 0 220 270",fill:"none",stroke:"#496446","stroke-width":1.25,"stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"});
 svg.classList.add("sol-botanical");
 for (const name of className.split(" ").filter(Boolean)) svg.classList.add(name);
 const layouts = {
  meadow:[[45,99,13],[73,52,16],[112,83,12],[147,40,11],[174,115,12],[100,132,9]],
  airy:[[62,68,12],[124,104,10],[159,47,8]],
  foliage:[[53,97,0],[88,54,0],[131,88,9],[167,41,0]],
  bloom:[[110,90,22]]
 };
 (layouts[variant] || layouts.meadow).forEach(([x,y,size],i) => {
  const stem = svgNode("g", {class:"sol-stem"});
  stem.style.setProperty("--stem-phase", `${-i * .43}s`);
  stem.style.setProperty("--stem-angle", `${2.5 + i % 3}deg`);
  stem.append(svgNode("path", {d:`M110 250 Q${x+18} 174 ${x} ${y}`}));
  const leafY = y + (250-y)*.55;
  stem.append(svgNode("path", {d:`M${(x+110)/2} ${leafY}q-29 -8 -25 -29q22 9 25 29m4 14q28 -10 25 -31q-24 12 -25 31`,fill:"#dae3cc"}));
  if(size) {
   const flower = svgNode("g", {class:"sol-petals"});
   const blue = i % 3 === 0 && variant !== "bloom";
   for(let angle=0;angle<360;angle+=60) flower.append(svgNode("ellipse",{cx:x,cy:y-size*.65,rx:size*.28,ry:size*.68,fill:blue?"#b9cddd":"#f0d376",stroke:blue?"#819bab":"#ceb15a",transform:`rotate(${angle} ${x} ${y})`}));
   flower.append(svgNode("circle",{cx:x,cy:y,r:size*.24,fill:"#c2a04c",stroke:"#c2a04c"}));
   stem.append(flower);
  } else {
   stem.append(svgNode("ellipse",{cx:x,cy:y,rx:4,ry:8,fill:"#c2cfb0",transform:`rotate(-20 ${x} ${y})`}));
  }
  svg.append(stem);
 });
 return svg;
}

// A low meadow joins the illustrated corners without crossing the text area.
export function meadowGround() {
 const svg = svgNode("svg", {viewBox:"0 0 1000 100",preserveAspectRatio:"none",fill:"none",stroke:"#687448","stroke-width":.8,"stroke-linecap":"round","aria-hidden":"true",focusable:"false",class:"sol-ground"});
 for (let i=0;i<55;i++) {
  const x = i*19-5, height = 20+(i*17)%54, lean = (i%3-1)*9;
  const stem = svgNode("g", {class:"sol-grass"});
  stem.style.transformOrigin = `${x}px 100px`;
  stem.style.setProperty("--stem-phase", `${-(i%9)/3}s`);
  stem.append(svgNode("path", {d:`M${x} 100Q${x+lean*2} ${100-height/2} ${x+lean} ${100-height}M${x} 91q-11 -18 -9 -28M${x+2} 87q12 -18 11 -25`}));
  for(let n=0;n<3;n++) stem.append(svgNode("ellipse",{cx:x+lean+(n%2?3:-3),cy:100-height+n*6,rx:1.7,ry:3.5,fill:i%4===0?"#dbbe66":"#b7bf94",transform:`rotate(${n%2?25:-25} ${x+lean} ${100-height+n*6})`}));
  svg.append(stem);
 }
 return svg;
}
