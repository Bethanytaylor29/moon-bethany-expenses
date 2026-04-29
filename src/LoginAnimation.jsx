export default function LoginAnimation() {
  return (
    <div className="flight-animation">
      <svg viewBox="0 0 500 500" className="flight-svg">
        <path
          id="flightPath"
          d="
            M 120 380
            C 120 260, 220 260, 250 330
            C 280 260, 380 260, 380 380
            C 380 450, 280 470, 250 420
            C 220 470, 120 450, 120 380
          "
          fill="none"
          stroke="#d6a94f"
          strokeWidth="6"
          strokeDasharray="14 14"
          strokeLinecap="round"
        />

        <g className="plane">
          <text x="0" y="0" fontSize="34">
            ✈
          </text>
        </g>
      </svg>
    </div>
  )
}