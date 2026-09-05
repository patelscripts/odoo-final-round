export const formatDate=(value)=>value?new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value)):"—";
export const daysBetween=(from,to)=>Math.ceil(Math.abs(new Date(to)-new Date(from))/86400000);
