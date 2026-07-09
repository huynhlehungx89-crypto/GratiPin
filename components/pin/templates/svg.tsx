export function FloralCornerSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden>
      <path
        d="M2 20 Q10 4 24 10 Q14 14 12 24 Q6 18 2 20Z"
        fill="#A9CBB7"
      />
      <circle cx="14" cy="12" r="3" fill="#F4A99B" />
    </svg>
  );
}

export function FloralBottomGrassSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 190 14" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 14 L0 8 Q6 3 9 8 L11 14 Q16 4 20 8 L23 14 Q28 3 32 9 L35 14 Q40 4 44 8 L47 14 Q52 3 56 9 L59 14 L95 14 Q99 3 103 9 L106 14 Q111 4 115 8 L118 14 Q123 3 127 9 L130 14 Q135 4 139 8 L142 14 Q147 3 151 9 L154 14 Q159 4 163 8 L166 14 Q171 3 175 9 L178 14 L190 14 L190 14 L0 14Z"
        fill="#A9CBB7"
      />
      <circle cx="20" cy="10" r="2" fill="#F4A99B" />
      <circle cx="106" cy="9" r="2" fill="#F2C879" />
      <circle cx="163" cy="9" r="2" fill="#F4A99B" />
    </svg>
  );
}

export function GardenGrassSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 190 22" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 22 L0 14 Q4 8 6 14 L8 22 Q10 10 13 14 L15 22 Q18 6 21 14 L23 22 Q26 12 29 14 L31 22 Q35 8 38 14 L40 22 Q44 10 47 14 L49 22 Q52 8 55 16 L57 22 L62 22 Q65 9 68 15 L70 22 Q74 10 77 14 L79 22 Q83 8 86 14 L88 22 Q92 12 95 14 L97 22 Q101 8 104 14 L106 22 Q109 10 112 14 L114 22 Q118 8 121 15 L123 22 L128 22 Q131 9 134 14 L136 22 Q140 10 143 14 L145 22 Q149 8 152 14 L154 22 Q158 12 161 14 L163 22 Q167 8 170 14 L172 22 Q176 10 179 15 L181 22 L190 22 L190 22 L0 22Z"
        fill="#8fae5a"
      />
    </svg>
  );
}

export function SunshineRaysSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 110 110" aria-hidden>
      <circle cx="20" cy="20" r="11" fill="#fff" />
      <g stroke="#fff" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="0" />
        <line x1="20" y1="20" x2="40" y2="20" />
        <line x1="20" y1="20" x2="35" y2="5" />
        <line x1="20" y1="20" x2="5" y2="35" />
        <line x1="20" y1="20" x2="35" y2="35" />
        <line x1="20" y1="20" x2="5" y2="5" />
        <line x1="20" y1="20" x2="0" y2="20" />
        <line x1="20" y1="20" x2="20" y2="40" />
      </g>
    </svg>
  );
}
