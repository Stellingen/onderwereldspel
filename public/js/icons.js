// Gedeelde symbolen van de Kluiskraker (spel en landingspagina)
const KK_ICON={
 munt:'<circle cx="24" cy="24" r="18" fill="#c99a5b"/><circle cx="24" cy="24" r="13.5" fill="none" stroke="#7a5426" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-family="Big Shoulders Display,sans-serif" font-weight="900" font-size="20" fill="#5b3a14">€</text>',
 dobbel:'<rect x="8" y="8" width="32" height="32" rx="6" fill="#ece8df"/><g fill="#191b20"><circle cx="16" cy="16" r="3"/><circle cx="32" cy="16" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="16" cy="32" r="3"/><circle cx="32" cy="32" r="3"/></g>',
 fiche:'<circle cx="24" cy="24" r="18" fill="#1fa56b"/><circle cx="24" cy="24" r="15" fill="none" stroke="#e9fff4" stroke-width="4" stroke-dasharray="5 4.4"/><circle cx="24" cy="24" r="9" fill="#14774c"/>',
 sleutel:'<circle cx="15" cy="24" r="9" fill="none" stroke="#a9dcff" stroke-width="5"/><path d="M23 22h20v5h-4v6h-5v-6h-3v4h-5v-4h-3z" fill="#a9dcff"/>',
 horloge:'<rect x="17" y="3" width="14" height="12" rx="2" fill="#6b5bb0"/><rect x="17" y="33" width="14" height="12" rx="2" fill="#6b5bb0"/><circle cx="24" cy="24" r="13" fill="#b8a1ff"/><circle cx="24" cy="24" r="9.5" fill="#211a3d"/><path d="M24 17v7l5 3" stroke="#b8a1ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
 ring:'<circle cx="24" cy="29" r="12" fill="none" stroke="#ff7fb3" stroke-width="5"/><path d="M17 14l7-8 7 8-7 6z" fill="#ffd1e4"/><path d="M17 14h14l-7 6z" fill="#ff7fb3"/>',
 diamant:'<path d="M8 18l8-10h16l8 10-16 22z" fill="#7fe7ff"/><path d="M8 18h32M16 8l8 10 8-10M24 18v22" stroke="#1b6f86" stroke-width="1.6" fill="none"/>',
 goud:'<path d="M6 36l5-11h26l5 11z" fill="#ffb02e"/><path d="M13 24l5-11h12l5 11z" fill="#ffcc66"/><path d="M6 36h36" stroke="#a86a0e" stroke-width="2"/>',
 kluis:'<rect x="6" y="6" width="36" height="36" rx="3" fill="#2a1406" stroke="#ff7a1a" stroke-width="3"/><circle cx="24" cy="24" r="11" fill="none" stroke="#ffad6b" stroke-width="3"/><g stroke="#ffad6b" stroke-width="3" stroke-linecap="round"><path d="M24 13v5M24 30v5M13 24h5M30 24h5"/></g><circle cx="24" cy="24" r="3.5" fill="#ff7a1a"/>'
};
const kkSvg=id=>`<svg viewBox="0 0 48 48" aria-hidden="true">${KK_ICON[id]}</svg>`;
