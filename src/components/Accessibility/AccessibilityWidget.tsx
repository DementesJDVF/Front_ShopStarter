import React, { useEffect, useRef } from 'react';
import { useA11y, DaltonismType } from '../../context/A11yContext';
import { Icon } from '@iconify/react';

/* ────────────────────────────────────────────────
   Filtros SVG embebidos (invisibles, necesarios para filter: url())
──────────────────────────────────────────────────*/
const A11ySvgFilters = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
  >
    <defs>
      <filter id="a11y-protanopia" colorInterpolationFilters="linearRGB">
        <feColorMatrix type="matrix" values="
          0.567, 0.433, 0,     0, 0
          0.558, 0.442, 0,     0, 0
          0,     0.242, 0.758, 0, 0
          0,     0,     0,     1, 0" />
      </filter>
      <filter id="a11y-deuteranopia" colorInterpolationFilters="linearRGB">
        <feColorMatrix type="matrix" values="
          0.625, 0.375, 0,     0, 0
          0.700, 0.300, 0,     0, 0
          0,     0.300, 0.700, 0, 0
          0,     0,     0,     1, 0" />
      </filter>
      <filter id="a11y-tritanopia" colorInterpolationFilters="linearRGB">
        <feColorMatrix type="matrix" values="
          0.950, 0.050, 0,     0, 0
          0,     0.433, 0.567, 0, 0
          0,     0.475, 0.525, 0, 0
          0,     0,     0,     1, 0" />
      </filter>
    </defs>
  </svg>
);

/* ────────────────────────────────────────────────
   Panel flotante global (se abre desde el botón del header)
──────────────────────────────────────────────────*/
const daltonismOptions: { value: DaltonismType; label: string; desc: string }[] = [
  { value: 'protanopia',    label: 'Protanopía',           desc: 'Dificultad con el rojo' },
  { value: 'deuteranopia',  label: 'Deuteranopía',         desc: 'Dificultad con el verde' },
  { value: 'tritanopia',    label: 'Tritanopía',           desc: 'Dificultad azul/amarillo' },
  { value: 'achromatopsia', label: 'Acromatopsia parcial', desc: 'Visión casi monocromática' },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    style={{
      width: '42px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
      backgroundColor: checked ? '#00324C' : '#CBD5E1',
      position: 'relative', transition: 'background-color 0.22s', flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute', top: '3px',
      left: checked ? '21px' : '3px',
      width: '18px', height: '18px', borderRadius: '50%',
      backgroundColor: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
      transition: 'left 0.22s',
    }} />
  </button>
);

export const A11yPanel = () => {
  const { prefs, update, isPanelOpen, setIsPanelOpen } = useA11y();
  const panelRef = useRef<HTMLDivElement>(null);

  // Cierra al hacer clic fuera
  useEffect(() => {
    if (!isPanelOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Si el clic es dentro del panel, no hacer nada
      if (panelRef.current && panelRef.current.contains(target)) return;
      
      // Si el clic es en algún botón del header, no hacer nada (su onClick lo maneja)
      if ((target as Element).closest('.a11y-header-btn')) return;

      setIsPanelOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isPanelOpen, setIsPanelOpen]);

  return (
    <>
      <A11ySvgFilters />
      
      {/* Overlay global para aplicar el filtro de color de daltonismo sin romper el layout */}
      {prefs.isActive && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 99997, 
            pointerEvents: 'none', 
            backdropFilter: prefs.daltonismType === 'achromatopsia' 
              ? 'grayscale(85%) contrast(1.15)' 
              : `url(#a11y-${prefs.daltonismType})` 
          }} 
        />
      )}

      {isPanelOpen && (
        <>
          {/* Overlay sutil para atrapar clics fuera del panel */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} aria-hidden="true" />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Panel de accesibilidad para daltonismo"
        style={{
          position: 'fixed',
          top: '70px',
          right: '16px',
          zIndex: 99999,
          width: '310px',
          borderRadius: '18px',
          backgroundColor: '#F4F7FB',
          boxShadow: '0 12px 50px rgba(0,30,76,0.18), 0 2px 10px rgba(0,50,76,0.1)',
          border: '1px solid rgba(0,50,76,0.1)',
          overflow: 'hidden',
          fontFamily: "'Manrope', system-ui, sans-serif",
          animation: 'a11y-panel-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header del panel */}
        <div style={{
          background: 'linear-gradient(135deg, #00324C 0%, #001E4C 100%)',
          color: '#fff', padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }} aria-hidden="true">♿</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em' }}>Accesibilidad Visual</div>
              <div style={{ fontSize: '11px', opacity: 0.65, marginTop: '1px' }}>Modo Daltonismo Inteligente</div>
            </div>
          </div>
          <button
            onClick={() => setIsPanelOpen(false)}
            aria-label="Cerrar panel"
            style={{
              background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px',
              color: '#fff', width: '28px', height: '28px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          >✕</button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Toggle principal */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#001E4C' }}>Activar modo daltonismo</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {prefs.isActive ? '● Activo' : '○ Desactivado'}
              </div>
            </div>
            <Toggle checked={prefs.isActive} onChange={() => update({ isActive: !prefs.isActive })} />
          </div>

          {/* Opciones condicionales */}
          <div style={{
            opacity: prefs.isActive ? 1 : 0.4,
            pointerEvents: prefs.isActive ? 'auto' : 'none',
            transition: 'opacity 0.2s',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#001E4C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Tipo de daltonismo
            </div>

            {daltonismOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => update({ daltonismType: opt.value })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 11px', borderRadius: '10px',
                  border: prefs.daltonismType === opt.value ? '2px solid #00324C' : '2px solid transparent',
                  backgroundColor: prefs.daltonismType === opt.value ? 'rgba(0,50,76,0.07)' : '#FFFFFF',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <span style={{
                  width: '13px', height: '13px', borderRadius: '50%',
                  border: '2px solid #00324C',
                  backgroundColor: prefs.daltonismType === opt.value ? '#00324C' : 'transparent',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {prefs.daltonismType === opt.value && (
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#fff', display: 'block' }} />
                  )}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px', color: '#001E4C' }}>{opt.label}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{opt.desc}</div>
                </div>
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(0,50,76,0.1)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { key: 'highContrast' as const,   label: 'Alto contraste',     desc: 'Refuerza bordes y contrastes', icon: '◑' },
                { key: 'visualPatterns' as const,  label: 'Patrones visuales',  desc: '▲ error  ● éxito  ⬡ aviso  ■ info',   icon: '' },
              ].map(opt => (
                <div key={opt.key} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 11px', borderRadius: '10px',
                  border: '1px solid rgba(0,50,76,0.08)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }} aria-hidden="true">{opt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: '#001E4C' }}>{opt.label}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{opt.desc}</div>
                  </div>
                  <Toggle checked={prefs[opt.key]} onChange={() => update({ [opt.key]: !prefs[opt.key] })} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer WCAG */}
        <div style={{
          padding: '8px 18px', borderTop: '1px solid rgba(0,50,76,0.08)',
          backgroundColor: 'rgba(0,50,76,0.03)',
        }}>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            ♿ WCAG AA/AAA · Las formas no dependen solo del color
          </span>
        </div>
      </div>

      <style>{`
        @keyframes a11y-panel-in {
          from { opacity: 0; transform: scale(0.94) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
        </>
      )}
    </>
  );
};

/* ────────────────────────────────────────────────
   Botón compacto para el Header (inline, no flotante)
──────────────────────────────────────────────────*/
export const A11yHeaderButton = ({ 
  className = '', 
  variant = 'default' 
}: { 
  className?: string; 
  variant?: 'default' | 'icon'; 
}) => {
  const { prefs, isPanelOpen, setIsPanelOpen } = useA11y();

  if (variant === 'icon') {
    return (
      <button
        id="a11y-header-btn"
        className={`p-2 rounded-xl text-white hover:bg-white/20 transition-all focus:ring-0 flex items-center justify-center relative ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsPanelOpen(!isPanelOpen);
        }}
        aria-label="Accesibilidad para daltonismo"
        aria-expanded={isPanelOpen}
        aria-haspopup="dialog"
        title="Accesibilidad visual"
      >
        <Icon icon="solar:accessibility-bold-duotone" className="w-5 h-5 text-white" />
        {/* Punto verde indicador de modo activo */}
        {prefs.isActive && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#22c55e',
            border: '1.5px solid #001E4C',
          }} aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <button
      id="a11y-header-btn"
      className={`a11y-header-btn ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPanelOpen(!isPanelOpen);
      }}
      aria-label="Accesibilidad para daltonismo"
      aria-expanded={isPanelOpen}
      aria-haspopup="dialog"
      title="Accesibilidad visual"
      style={{
        position: 'relative',
        width: '36px', height: '36px',
        borderRadius: '50%',
        border: prefs.isActive ? '2px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.15)',
        backgroundColor: isPanelOpen
          ? 'rgba(255,255,255,0.22)'
          : prefs.isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '17px',
        backdropFilter: 'blur(8px)',
        boxShadow: prefs.isActive ? '0 0 0 3px rgba(255,255,255,0.08)' : 'none',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)'; }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = isPanelOpen
          ? 'rgba(255,255,255,0.22)'
          : prefs.isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)';
      }}
    >
      ♿
      {/* Punto verde indicador de modo activo */}
      {prefs.isActive && (
        <span style={{
          position: 'absolute', top: '1px', right: '1px',
          width: '9px', height: '9px', borderRadius: '50%',
          backgroundColor: '#22c55e',
          border: '1.5px solid #001E4C',
        }} aria-hidden="true" />
      )}
    </button>
  );
};

export default A11yPanel;
