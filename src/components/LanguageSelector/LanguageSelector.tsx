import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'src/components/LanguageSelector/LanguageSelector.css';
import LanguageIcon from 'src/assets/language-icon.svg';
import { Icon } from '@iconify/react';

interface LanguageSelectorProps {
  variant?: 'default' | 'icon';
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'default', className = '' }) => {
  const { i18n, t } = useTranslation('languageSelector');
  const [open, setOpen] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  const languages = [
    { code: 'es', label: t('es_label', 'Español') },
    { code: 'en', label: t('en_label', 'English') }
  ];

  const listId = 'language-selector-list';

   return (
     <div className={`language-selector-root ${className}`}>
      {variant === 'icon' ? (
        <button
          className="p-2 rounded-xl text-white hover:bg-white/20 transition-all focus:ring-0 flex items-center justify-center"
          onClick={() => setOpen((prev) => !prev)}
          key={i18n.language}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          type="button"
        >
          <Icon icon="solar:global-bold-duotone" className="w-5 h-5 text-white" />
        </button>
      ) : (
        <button
          className="language-selector-button"
          onClick={() => setOpen((prev) => !prev)}
          key={i18n.language}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          type="button"
        >
          {/* SVG icon (decorative) + emoji fallback kept */}
          <img
            src={LanguageIcon as unknown as string}
            className="language-selector-icon"
            alt=""
            aria-hidden="true"
          />
          <span className="language-label">{t('language')}</span>
        </button>
      )}

      {open && (
        <ul
          className={`language-selector-list ${variant === 'icon' ? 'right' : ''}`}
          id={listId}
          role="listbox"
          aria-label={t('language')}
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                className="language-selector-option"
                onClick={() => changeLanguage(lang.code)}
                role="option"
                aria-selected={i18n.language === lang.code}
                type="button"
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;