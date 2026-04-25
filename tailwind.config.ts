import type { Config } from "tailwindcss";
import flowbite from "flowbite-react/tailwind";
import flowbitePlugin from "flowbite/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",

    // Flowbite content
    flowbite.content(),
  ],


  theme: {
    fontFamily: {
      sans: ['Manrope', 'system-ui', 'serif'], // Define a custom sans-serif font family
    },
    extend: {
      animation: {
        blob: "blob 7s infinite",
        tilt: "tilt 5s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        tilt: {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(2deg)" },
          "75%": { transform: "rotate(-2deg)" },
        },
      },
      boxShadow: {
        md: "0px 2px 4px -1px rgba(175, 182, 201, 0.2);",
        lg: "0 1rem 3rem rgba(0, 0, 0, 0.175)",
        "dark-md":
          "rgba(0, 0, 0, 0.8) 0px 4px 10px, rgba(0, 0, 0, 0.6) 0px 2px 4px",
        sm: "0 6px 24.2px -10px rgba(41, 52, 61, .22)",
        "btn-shadow": "box-shadow: rgba(0, 0, 0, .05) 0 9px 17.5px",
        tw:"rgba(175, 182, 201, 0.2) 0px 2px 4px -1px",
        btnshdw: "0 17px 20px -8px rgba(77, 91, 236, .231372549)",
        elevation1:"0px 12px 30px -2px rgba(58,75,116,0.14);",
        elevation2:"0px 24px 24px -12px rgba(0,0,0,0.05);",
        elevation3:"0px 24px 24px -12px rgba(99,91,255,0.15);",
        elevation4:"0px 12px 12px -6px rgba(0,0,0,0.15);"
      },
      borderRadius: {
        sm: "6px",
        md: "9px",
        lg: "24px",
        tw: "12px",
        bb: "20px",
      },
      container: {
        center: true,
        padding: "20px",
      },
      letterSpacing: {
        tightest: "-.075em",
        tighter: "-.05em",
        tight: "-.025em",
        normal: "0",
        wide: ".025em",
        wider: ".05em",
        widest: "1.5px",
      },
      gap: {
        "30": "1.875rem",
      },
      padding: {
        "30": "1.875rem",
      },
      margin: {
        "30": "1.875rem",
      },
      fontSize: {
        "13": "0.8125rem",
        "15": "0.9375rem",
        "17": "1.0625rem",
        "22": "1.375rem",
        "28": "1.75rem",
        "34": "2.125rem",
        "40": "2.5rem",
        "44": "2.75rem",
        "50": "3.125rem",
        "56": "3.5rem",
        "64": "4rem",
      },
      colors: {
        cyan: {
          "500": "var(--color-primary)",
          "600": "var(--color-primary)",
          "700": "var(--color-primary)",
        },

        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        info: "var(--color-info)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        lightprimary: "var(--color-lightprimary)",
        lightsecondary: "var(--color-lightsecondary)",
        lightsuccess: "var( --color-lightsuccess)",
        lighterror: "var(--color-lighterror)",
        lightinfo: "var(--color-lightinfo)",
        lightwarning: "var(--color-lightwarning)",
        border: "var(--color-border)",
        bordergray: "var(--color-bordergray)",
        lightgray: "var( --color-lightgray)",
        muted: "var(--color-muted)",
        lighthover: "var(--color-lighthover)",
        surface: "var(--color-surface-ld)",
        sky: "var(--color-sky)",
        bodytext: "var(--color-bodytext)",
        //Dark Colors Variables
        dark: "var(--color-dark)",
        link: "var(--color-link)",
        darklink: "var(--color-darklink)",
        darkborder: "var(--color-darkborder)",
        darkgray: "var(--color-darkgray)",
        primaryemphasis: "var(--color-primary-emphasis)",
        secondaryemphasis: "var(--color-secondary-emphasis)",
        warningemphasis: "var(--color-warning-emphasis)",
        erroremphasis: "var(--color-error-emphasis)",
        successemphasis: "var(--color-success-emphasis)",
        infoemphasis: "var(--color-info-emphasis)",
        darkmuted: "var( --color-darkmuted)",
        "dark-light": "var(--color-darkmuted)",
      },

    },
  },
  plugins: [
    //Add Flowbite Plugin
    flowbitePlugin,
  ],
};
export default config;
