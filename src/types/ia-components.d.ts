/// <reference types="react" />
declare module "../ia/IAErrorAlert" {
  const IAErrorAlert: React.FC<{ visible?: boolean; mensaje?: string; duracion?: number }>;
  export default IAErrorAlert;
}
declare module "../ia/IACriticalBadge" {
  const IACriticalBadge: React.FC<{ label?: string; severity?: string }>;
  export default IACriticalBadge;
}
