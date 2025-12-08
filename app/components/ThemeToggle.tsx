// "use client";

// import { useTheme } from "@/providers/theme-provider";
// import { Sun, Moon } from "lucide-react";
// import { useEffect, useState } from "react";
// export function ThemeToggle() {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return <div className="p-2 rounded-xl bg-amber-100 w-[34px] h-[34px]" />;
//   }

//   return <ThemeToggleInner />;
// }

// function ThemeToggleInner() {
//   const { theme, toggleTheme } = useTheme();

//   return (

//       {theme === "light" ? (
//         <Moon size={18} className="transition-transform duration-300" />
//       ) : (
//         <Sun size={18} className="transition-transform duration-300" />
//       )}
//     </button>
//   );
// }
