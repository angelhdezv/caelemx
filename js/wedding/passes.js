function node(tag, text, className) {
 const element = document.createElement(tag);
 if (text != null) element.textContent = text;
 if (className) element.className = className;
 return element;
}

// Both templates share the labelled native select and the same pass limits.
export function setupPassStepper(root, data) {
 const select = root.querySelector("#attendees");
 const stepper = node("div",null,"pass-stepper");
 stepper.setAttribute("role","group"); stepper.setAttribute("aria-label","Número de asistentes");
 const minus = node("button","−"); minus.type = "button"; minus.setAttribute("aria-label","Quitar un asistente");
 const plus = node("button","+"); plus.type = "button"; plus.setAttribute("aria-label","Agregar un asistente");
 const middle = node("div",null,"pass-value");
 select.before(stepper); middle.append(select,node("span","PERSONAS"));
 stepper.append(minus,middle,plus);
 const sync = () => {
  const n = Number(select.value);
  minus.disabled = select.disabled || n <= 1;
  plus.disabled = select.disabled || n >= data.invitation.maxPasses;
 };
 minus.addEventListener("click",()=>{select.value=String(Math.max(1,Number(select.value)-1));select.dispatchEvent(new Event("change",{bubbles:true}));});
 plus.addEventListener("click",()=>{select.value=String(Math.min(data.invitation.maxPasses,Number(select.value)+1));select.dispatchEvent(new Event("change",{bubbles:true}));});
 select.addEventListener("change",sync); sync();
 // Retain the real labelled select: native keyboard and screen-reader operation,
 // plus/minus controls and submit all use the same value.
}
